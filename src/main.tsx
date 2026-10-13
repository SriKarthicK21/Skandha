// Must stay the first import: defines missing Node globals (e.g. `process`)
// before any module in the application graph reads them. See the module for
// why some server modules are reachable from the browser bundle.
import './lib/nodeStubs/browserEnv';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

/**
 * Attach the server-issued session token to every API request.
 *
 * The platform has 150+ independent `fetch()` call sites and no shared API
 * client, so instead of editing each one the token is injected centrally here.
 * The token itself is persisted by GRCContext when a real login succeeds
 * (`POST /api/v1/auth/login` → sessionContext.sessionToken).
 *
 * Requests without a token are left untouched: in development the API auth
 * gate may be off, and a malformed header would be worse than an absent one.
 */
const SESSION_TOKEN_KEY = 'grc_portal_state_v1_session_token';

if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let nextInit = init;

    try {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : (input as Request).url;

      const isApiCall = typeof url === 'string' && (url.startsWith('/api/') || url.startsWith('/scim/') || url.includes('/api/'));

      if (isApiCall) {
        const token = localStorage.getItem(SESSION_TOKEN_KEY);
        if (token) {
          const headers = new Headers(
            init?.headers || (input instanceof Request ? input.headers : undefined)
          );
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
            nextInit = {...(init || {}), headers};
          }
        }
      }
    } catch {
      // Never let header injection break a request; fall through untouched.
    }

    return nativeFetch(input, nextInit);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
