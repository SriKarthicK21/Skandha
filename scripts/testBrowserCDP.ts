import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function checkHeadlessBrowser() {
  console.log('Testing headless browser launch...');
  const browserPath = CHROME_PATH;
  const port = 9222;
  const browserProc = spawn(browserPath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:3000'
  ]);

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    const data = await res.json();
    console.log('Headless browser successfully connected:', data.Browser);
    browserProc.kill();
    return true;
  } catch (err: any) {
    console.log('CDP connection check failed:', err?.message);
    browserProc.kill();
    return false;
  }
}

checkHeadlessBrowser().then(() => process.exit(0));
