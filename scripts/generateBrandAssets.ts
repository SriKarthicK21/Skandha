import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

// 1. Build the Master Official SKANDA Logo SVG (1024x1024)
export function generateMasterLogoSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none">
  <defs>
    <!-- Background Gradient: Deep Royal Navy to Midnight -->
    <radialGradient id="navyBg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#122A56"/>
      <stop offset="45%" stop-color="#0B1E3F"/>
      <stop offset="85%" stop-color="#071328"/>
      <stop offset="100%" stop-color="#040B18"/>
    </radialGradient>

    <!-- Ambient Gold Radiance behind Emblem -->
    <radialGradient id="goldGlow" cx="50%" cy="62%" r="42%">
      <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.32"/>
      <stop offset="45%" stop-color="#D4AF37" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
    </radialGradient>

    <!-- Metallic Antique Gold Gradient (Primary) -->
    <linearGradient id="antiqueGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5C2"/>
      <stop offset="22%" stop-color="#F5DE88"/>
      <stop offset="48%" stop-color="#D4AF37"/>
      <stop offset="78%" stop-color="#A67C1E"/>
      <stop offset="100%" stop-color="#6E4F0A"/>
    </linearGradient>

    <!-- Metallic Gold Light (Highlight) -->
    <linearGradient id="goldLight" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="25%" stop-color="#FFF1B0"/>
      <stop offset="55%" stop-color="#E5C158"/>
      <stop offset="85%" stop-color="#B88A28"/>
      <stop offset="100%" stop-color="#7A560E"/>
    </linearGradient>

    <!-- Metallic Gold Dark (Shadows) -->
    <linearGradient id="goldDark" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E6C86E"/>
      <stop offset="50%" stop-color="#B88A28"/>
      <stop offset="100%" stop-color="#543A04"/>
    </linearGradient>

    <!-- Peacock Feather Teal & Blue Gradient -->
    <linearGradient id="peacockTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00D2D3"/>
      <stop offset="40%" stop-color="#008C95"/>
      <stop offset="85%" stop-color="#0066CC"/>
      <stop offset="100%" stop-color="#082A66"/>
    </linearGradient>

    <!-- Emerald Green Gradient -->
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="45%" stop-color="#16845B"/>
      <stop offset="85%" stop-color="#0D5A3E"/>
      <stop offset="100%" stop-color="#052E20"/>
    </linearGradient>

    <!-- Deep Sapphire Eye Accent -->
    <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#0066CC"/>
      <stop offset="100%" stop-color="#0B1E3F"/>
    </linearGradient>

    <!-- Bevel & Shadow Filter -->
    <filter id="subtleDrop" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
    <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Deep Royal Navy Canvas Background -->
  <rect width="1024" height="1024" fill="url(#navyBg)"/>
  
  <!-- Subtle Vignette Frame Border -->
  <rect x="16" y="16" width="992" height="992" rx="48" fill="none" stroke="url(#antiqueGold)" stroke-width="1.5" stroke-opacity="0.15"/>
  <rect x="28" y="28" width="968" height="968" rx="40" fill="none" stroke="url(#antiqueGold)" stroke-width="0.75" stroke-opacity="0.08"/>

  <!-- Ambient Golden Glow behind Central Emblem -->
  <circle cx="512" cy="610" r="310" fill="url(#goldGlow)"/>

  <!-- ========================================== -->
  <!-- 1. TYPOGRAPHY & WORDMARK                   -->
  <!-- ========================================== -->

  <!-- Top Wordmark: SKANDA -->
  <g id="skanda-wordmark" filter="url(#subtleDrop)">
    <!-- Main SKANDA Serif Heading (Custom SVG Letterforms for Cross-Platform Precision) -->
    <text x="512" y="325" 
          text-anchor="middle" 
          font-family="'Cinzel', 'Playfair Display', 'Times New Roman', 'Baskerville', serif" 
          font-size="96" 
          font-weight="700" 
          letter-spacing="14" 
          fill="url(#goldLight)"
          stroke="#7A560E"
          stroke-width="1.5"
          style="text-transform: uppercase;">
      SKANDA
    </text>

    <!-- Metallic Gold Highlight Line across SKANDA -->
    <path d="M 288 338 L 736 338" stroke="url(#antiqueGold)" stroke-width="1.2" stroke-opacity="0.85"/>

    <!-- Subtitle: PREMIUM EXCELLENCE | EST. 2026 -->
    <text x="512" y="362" 
          text-anchor="middle" 
          font-family="'Inter', 'Plus Jakarta Sans', 'Segoe UI', sans-serif" 
          font-size="14" 
          font-weight="600" 
          letter-spacing="6.5" 
          fill="#F5E6C8">
      PREMIUM EXCELLENCE  |  EST. 2026
    </text>

    <!-- Tagline: SECURE • EMPOWER • EVOLVE with accent rules -->
    <g transform="translate(0, 380)">
      <line x1="280" y1="-4" x2="350" y2="-4" stroke="url(#antiqueGold)" stroke-width="1" stroke-opacity="0.7"/>
      <text x="512" y="0" 
            text-anchor="middle" 
            font-family="'Inter', 'Plus Jakarta Sans', sans-serif" 
            font-size="11.5" 
            font-weight="500" 
            letter-spacing="5" 
            fill="#D4AF37">
        SECURE  •  EMPOWER  •  EVOLVE
      </text>
      <line x1="674" y1="-4" x2="744" y2="-4" stroke="url(#antiqueGold)" stroke-width="1" stroke-opacity="0.7"/>
    </g>
  </g>

  <!-- ========================================== -->
  <!-- 2. CENTRAL EMBLEM: LAUREL, VEL & PEACOCK    -->
  <!-- ========================================== -->
  <g id="skanda-emblem" filter="url(#goldShine)">

    <!-- A. GOLDEN LAUREL WREATH (SYMMETRICAL SURROUND) -->
    <!-- Left Branch -->
    <g id="laurel-left">
      <!-- Main Curved Stem -->
      <path d="M 500 755 C 380 750 280 670 280 545 C 280 470 320 415 355 390" 
            fill="none" stroke="url(#antiqueGold)" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 500 755 C 380 750 280 670 280 545 C 280 470 320 415 355 390" 
            fill="none" stroke="url(#goldLight)" stroke-width="1.8" stroke-linecap="round"/>

      <!-- Pairs of Laurel Leaves ascending (Left) -->
      <!-- Leaf 1 (bottom) -->
      <path d="M 480 752 C 455 765 425 760 410 740 C 430 735 460 740 480 752 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <path d="M 465 745 C 450 742 435 746 425 748" stroke="#FFFFFF" stroke-width="0.6"/>

      <!-- Leaf 2 -->
      <path d="M 410 735 C 375 745 340 730 330 705 C 355 700 390 710 410 735 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="370" cy="725" r="3.5" fill="url(#peacockTealGrad)"/>

      <!-- Leaf 3 -->
      <path d="M 345 695 C 315 705 285 685 275 655 C 298 650 330 665 345 695 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <!-- Leaf 4 -->
      <path d="M 305 645 C 275 650 250 625 248 595 C 270 595 295 615 305 645 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="280" cy="625" r="3.5" fill="url(#emeraldGrad)"/>

      <!-- Leaf 5 -->
      <path d="M 285 585 C 255 580 240 550 245 520 C 265 528 280 555 285 585 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <!-- Leaf 6 -->
      <path d="M 282 515 C 260 500 252 468 265 440 C 282 455 288 485 282 515 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="268" cy="480" r="3.5" fill="url(#peacockTealGrad)"/>

      <!-- Leaf 7 -->
      <path d="M 295 445 C 280 422 282 390 305 370 C 316 392 312 422 295 445 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <!-- Leaf 8 (top left tip) -->
      <path d="M 325 395 C 318 368 330 340 355 330 C 360 355 348 382 325 395 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="340" cy="365" r="3" fill="url(#emeraldGrad)"/>
    </g>

    <!-- Right Branch (Mirrored Symmetry) -->
    <g id="laurel-right">
      <!-- Main Curved Stem -->
      <path d="M 524 755 C 644 750 744 670 744 545 C 744 470 704 415 669 390" 
            fill="none" stroke="url(#antiqueGold)" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M 524 755 C 644 750 744 670 744 545 C 744 470 704 415 669 390" 
            fill="none" stroke="url(#goldLight)" stroke-width="1.8" stroke-linecap="round"/>

      <!-- Pairs of Laurel Leaves ascending (Right) -->
      <!-- Leaf 1 (bottom) -->
      <path d="M 544 752 C 569 765 599 760 614 740 C 594 735 564 740 544 752 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <path d="M 559 745 C 574 742 589 746 599 748" stroke="#FFFFFF" stroke-width="0.6"/>

      <!-- Leaf 2 -->
      <path d="M 614 735 C 649 745 684 730 694 705 C 669 700 634 710 614 735 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="654" cy="725" r="3.5" fill="url(#peacockTealGrad)"/>

      <!-- Leaf 3 -->
      <path d="M 679 695 C 709 705 739 685 749 655 C 726 650 694 665 679 695 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <!-- Leaf 4 -->
      <path d="M 719 645 C 749 650 774 625 776 595 C 754 595 729 615 719 645 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="744" cy="625" r="3.5" fill="url(#emeraldGrad)"/>

      <!-- Leaf 5 -->
      <path d="M 739 585 C 769 580 784 550 779 520 C 759 528 744 555 739 585 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <!-- Leaf 6 -->
      <path d="M 742 515 C 764 500 772 468 759 440 C 742 455 736 485 742 515 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="756" cy="480" r="3.5" fill="url(#peacockTealGrad)"/>

      <!-- Leaf 7 -->
      <path d="M 729 445 C 744 422 742 390 719 370 C 708 392 712 422 729 445 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <!-- Leaf 8 (top right tip) -->
      <path d="M 699 395 C 706 368 694 340 669 330 C 664 355 676 382 699 395 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      <circle cx="684" cy="365" r="3" fill="url(#emeraldGrad)"/>
    </g>

    <!-- B. PEACOCK FEATHER TRAIN / RADIAL FAN (BACKGROUND OF EMBLEM) -->
    <g id="peacock-fan">
      <!-- Outer Ring of Radiating Feathers -->
      <!-- Center hub is at (512, 590) -->
      <!-- 12 Outer Feather Eyes -->
      <!-- Feather -65 deg -->
      <g transform="translate(512, 590) rotate(-65) translate(0, -170)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather -48 deg -->
      <g transform="translate(512, 590) rotate(-48) translate(0, -180)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather -30 deg -->
      <g transform="translate(512, 590) rotate(-30) translate(0, -186)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather -14 deg -->
      <g transform="translate(512, 590) rotate(-14) translate(0, -190)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather +14 deg -->
      <g transform="translate(512, 590) rotate(14) translate(0, -190)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather +30 deg -->
      <g transform="translate(512, 590) rotate(30) translate(0, -186)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather +48 deg -->
      <g transform="translate(512, 590) rotate(48) translate(0, -180)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>
      <!-- Feather +65 deg -->
      <g transform="translate(512, 590) rotate(65) translate(0, -170)">
        <path d="M 0 -35 C 24 -15 28 15 0 35 C -28 15 -24 -15 0 -35 Z" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1.2"/>
        <path d="M 0 -26 C 18 -10 20 10 0 26 C -20 10 -18 -10 0 -26 Z" fill="url(#peacockTealGrad)"/>
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="2" r="4.5" fill="#0B1E3F"/>
      </g>

      <!-- Inner Ring of Radiating Feathers -->
      <!-- -55 deg -->
      <g transform="translate(512, 590) rotate(-55) translate(0, -115)">
        <path d="M 0 -25 C 18 -10 20 10 0 25 C -20 10 -18 -10 0 -25 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
        <path d="M 0 -18 C 12 -8 14 8 0 18 C -14 8 -12 -8 0 -18 Z" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="0" r="4" fill="url(#peacockTealGrad)"/>
      </g>
      <!-- -35 deg -->
      <g transform="translate(512, 590) rotate(-35) translate(0, -125)">
        <path d="M 0 -25 C 18 -10 20 10 0 25 C -20 10 -18 -10 0 -25 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
        <path d="M 0 -18 C 12 -8 14 8 0 18 C -14 8 -12 -8 0 -18 Z" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="0" r="4" fill="url(#peacockTealGrad)"/>
      </g>
      <!-- -18 deg -->
      <g transform="translate(512, 590) rotate(-18) translate(0, -130)">
        <path d="M 0 -25 C 18 -10 20 10 0 25 C -20 10 -18 -10 0 -25 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
        <path d="M 0 -18 C 12 -8 14 8 0 18 C -14 8 -12 -8 0 -18 Z" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="0" r="4" fill="url(#peacockTealGrad)"/>
      </g>
      <!-- +18 deg -->
      <g transform="translate(512, 590) rotate(18) translate(0, -130)">
        <path d="M 0 -25 C 18 -10 20 10 0 25 C -20 10 -18 -10 0 -25 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
        <path d="M 0 -18 C 12 -8 14 8 0 18 C -14 8 -12 -8 0 -18 Z" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="0" r="4" fill="url(#peacockTealGrad)"/>
      </g>
      <!-- +35 deg -->
      <g transform="translate(512, 590) rotate(35) translate(0, -125)">
        <path d="M 0 -25 C 18 -10 20 10 0 25 C -20 10 -18 -10 0 -25 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
        <path d="M 0 -18 C 12 -8 14 8 0 18 C -14 8 -12 -8 0 -18 Z" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="0" r="4" fill="url(#peacockTealGrad)"/>
      </g>
      <!-- +55 deg -->
      <g transform="translate(512, 590) rotate(55) translate(0, -115)">
        <path d="M 0 -25 C 18 -10 20 10 0 25 C -20 10 -18 -10 0 -25 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
        <path d="M 0 -18 C 12 -8 14 8 0 18 C -14 8 -12 -8 0 -18 Z" fill="url(#emeraldGrad)"/>
        <circle cx="0" cy="0" r="4" fill="url(#peacockTealGrad)"/>
      </g>

      <!-- Radiating Gold Filigree Barbs -->
      <g stroke="url(#antiqueGold)" stroke-width="1.2" stroke-linecap="round" opacity="0.85">
        <line x1="512" y1="590" x2="350" y2="430"/>
        <line x1="512" y1="590" x2="390" y2="415"/>
        <line x1="512" y1="590" x2="435" y2="405"/>
        <line x1="512" y1="590" x2="485" y2="400"/>
        <line x1="512" y1="590" x2="539" y2="400"/>
        <line x1="512" y1="590" x2="589" y2="405"/>
        <line x1="512" y1="590" x2="634" y2="415"/>
        <line x1="512" y1="590" x2="674" y2="430"/>
      </g>
    </g>

    <!-- C. SACRED VEL SPEAR (CENTRAL VERTICAL AXIS) -->
    <g id="vel-spear">
      <!-- Vel Top Spearhead (Flame/Leaf Sacred Blade) -->
      <!-- Spearhead Center: x=512, y=390 to 475 -->
      <path d="M 512 390 
               C 536 415 544 435 538 458 
               C 532 475 522 480 512 485 
               C 502 480 492 475 486 458 
               C 480 435 488 415 512 390 Z" 
            fill="url(#goldLight)" 
            stroke="#6E4F0A" 
            stroke-width="1.8"/>

      <!-- Inner Facets of Spearhead Blade -->
      <path d="M 512 393 L 512 482" stroke="#FFFFFF" stroke-width="1.6"/>
      <path d="M 512 393 C 526 415 532 432 528 450 C 524 464 518 472 512 476 Z" fill="url(#peacockTealGrad)" opacity="0.35"/>
      <path d="M 512 393 C 498 415 492 432 496 450 C 500 464 506 472 512 476 Z" fill="url(#emeraldGrad)" opacity="0.35"/>

      <!-- Golden Collar Rings below Spearhead -->
      <rect x="506" y="485" width="12" height="4" rx="1.5" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.6"/>
      <rect x="504" y="491" width="16" height="3" rx="1" fill="url(#goldLight)"/>

      <!-- Straight Vertical Golden Spear Shaft -->
      <rect x="509" y="494" width="6" height="265" rx="2" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="0.8"/>
      <line x1="512" y1="495" x2="512" y2="755" stroke="#FFFFFF" stroke-width="1.2"/>

      <!-- Lower Collar & Pommel -->
      <rect x="504" y="755" width="16" height="5" rx="1.5" fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="0.8"/>
      
      <!-- Spear Pointed Base (Downward Tip) -->
      <path d="M 505 760 L 519 760 L 512 785 Z" fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
      <line x1="512" y1="760" x2="512" y2="782" stroke="#FFFFFF" stroke-width="1"/>
    </g>

    <!-- D. PEACOCK BODY, CREST & HEAD (FACING RIGHT IN PROFILE) -->
    <g id="peacock-body">
      <!-- 3 Crest Feathers with Jewels at Crown -->
      <!-- Center Crest -->
      <line x1="500" y1="518" x2="488" y2="492" stroke="url(#antiqueGold)" stroke-width="1.5"/>
      <circle cx="487" cy="490" r="3.5" fill="url(#peacockTealGrad)" stroke="url(#goldLight)" stroke-width="1"/>

      <!-- Left Crest -->
      <line x1="497" y1="520" x2="478" y2="500" stroke="url(#antiqueGold)" stroke-width="1.5"/>
      <circle cx="476" cy="498" r="3" fill="url(#emeraldGrad)" stroke="url(#goldLight)" stroke-width="1"/>

      <!-- Right Crest -->
      <line x1="503" y1="518" x2="498" y2="488" stroke="url(#antiqueGold)" stroke-width="1.5"/>
      <circle cx="498" cy="486" r="3" fill="url(#sapphireGrad)" stroke="url(#goldLight)" stroke-width="1"/>

      <!-- Peacock Head & Beak Profile (Facing Right) -->
      <path d="M 494 532 
               C 490 524 496 515 506 515 
               C 516 515 524 520 532 525 
               L 544 528 
               L 530 534 
               C 525 540 518 546 512 555 
               C 506 565 505 580 507 605 
               C 508 625 515 645 522 665 
               C 515 665 500 655 492 635 
               C 485 615 484 590 488 565 
               C 490 550 493 540 494 532 Z" 
            fill="url(#goldLight)" 
            stroke="#6E4F0A" 
            stroke-width="1.5"/>

      <!-- High-Shine Throat & Breast Highlight -->
      <path d="M 504 520 C 512 520 520 525 528 529 L 536 531 L 526 536 C 520 542 514 550 510 560 C 506 572 506 590 508 610" 
            stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round"/>

      <!-- Eye (Teal Pupil with Gold Rim) -->
      <circle cx="513" cy="524" r="3.2" fill="url(#peacockTealGrad)" stroke="url(#goldLight)" stroke-width="0.8"/>
      <circle cx="514" cy="523.5" r="1.2" fill="#0B1E3F"/>
      <circle cx="514.5" cy="523" r="0.5" fill="#FFFFFF"/>

      <!-- S-Curved Wing Feathers on Body (Layered) -->
      <path d="M 492 575 C 475 595 465 625 470 655 C 475 660 485 660 495 650 C 490 630 488 605 492 575 Z" 
            fill="url(#antiqueGold)" stroke="#6E4F0A" stroke-width="1"/>
      <path d="M 474 615 C 468 630 468 645 472 655" stroke="url(#emeraldGrad)" stroke-width="2.5" stroke-linecap="round"/>

      <path d="M 482 645 C 465 670 450 705 465 725 C 475 728 490 715 498 695 C 492 675 488 658 482 645 Z" 
            fill="url(#goldLight)" stroke="#6E4F0A" stroke-width="1"/>
      <path d="M 468 685 C 462 700 464 712 470 720" stroke="url(#peacockTealGrad)" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </g>
</svg>`;
}

// 2. Build the Official Simplified Icon SVG (512x512) for Favicon, Mobile App Mark & Collapsed Sidebar
export function generateSimplifiedIconSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <!-- Background Gradient: Deep Royal Navy to Midnight -->
    <radialGradient id="iconNavyBg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#122A56"/>
      <stop offset="45%" stop-color="#0B1E3F"/>
      <stop offset="90%" stop-color="#051020"/>
    </radialGradient>

    <!-- Metallic Antique Gold Gradient (Primary) -->
    <linearGradient id="iconAntiqueGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5C2"/>
      <stop offset="25%" stop-color="#F5DE88"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="78%" stop-color="#A67C1E"/>
      <stop offset="100%" stop-color="#6E4F0A"/>
    </linearGradient>

    <linearGradient id="iconGoldLight" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="30%" stop-color="#FFF1B0"/>
      <stop offset="60%" stop-color="#E5C158"/>
      <stop offset="90%" stop-color="#B88A28"/>
      <stop offset="100%" stop-color="#7A560E"/>
    </linearGradient>

    <!-- Peacock Feather Teal & Blue Gradient -->
    <linearGradient id="iconPeacockTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00E5FF"/>
      <stop offset="40%" stop-color="#008C95"/>
      <stop offset="85%" stop-color="#0066CC"/>
      <stop offset="100%" stop-color="#0B1E3F"/>
    </linearGradient>

    <!-- Emerald Green Gradient -->
    <linearGradient id="iconEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="50%" stop-color="#16845B"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>

    <filter id="iconDrop" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Deep Royal Navy Canvas -->
  <rect width="512" height="512" rx="100" fill="url(#iconNavyBg)"/>

  <!-- Outer Double Gold Coin Rings -->
  <circle cx="256" cy="256" r="226" fill="none" stroke="url(#iconAntiqueGold)" stroke-width="9" filter="url(#iconDrop)"/>
  <circle cx="256" cy="256" r="226" fill="none" stroke="url(#iconGoldLight)" stroke-width="2.5"/>
  <circle cx="256" cy="256" r="212" fill="none" stroke="url(#iconAntiqueGold)" stroke-width="1.8" stroke-dasharray="3 3" opacity="0.65"/>
  <circle cx="256" cy="256" r="202" fill="none" stroke="url(#iconAntiqueGold)" stroke-width="1" opacity="0.4"/>

  <!-- Stylized Serif 'S' with Integrated Peacock Feather Plume Flourish -->
  <g id="skanda-s-mark" filter="url(#iconDrop)">
    <!-- Main Gold 'S' Body with Classical Serif Top Terminal -->
    <!-- Top Terminal Hook -->
    <path d="M 330 152 
             C 310 135 285 125 256 125 
             C 205 125 168 155 168 198 
             C 168 240 198 260 238 276 
             L 272 290 
             C 315 308 344 332 344 375 
             C 344 425 298 455 240 455 
             C 210 455 180 445 158 430 
             L 165 405 
             C 188 420 215 430 240 430 
             C 285 430 318 408 318 375 
             C 318 340 292 320 252 304 
             L 218 290 
             C 178 272 144 248 144 198 
             C 144 142 195 100 256 100 
             C 292 100 324 112 346 130 Z" 
          fill="url(#iconGoldLight)" 
          stroke="#6E4F0A" 
          stroke-width="2"/>

    <!-- High-Shine Inner Edge Highlight on 'S' -->
    <path d="M 338 135 C 318 118 288 108 256 108 C 205 108 152 145 152 198 C 152 240 182 265 224 282 L 258 296 C 305 315 334 338 334 375 C 334 418 295 445 240 445" 
          stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- Dynamic Peacock Feather Plumes Sweeping from Lower Hook -->
    <!-- Feather 1 (Peacock Teal Plume) -->
    <path d="M 160 380 
             C 140 330 160 280 195 245 
             C 180 275 182 310 195 340 
             C 190 355 178 370 160 380 Z" 
          fill="url(#iconPeacockTeal)" 
          stroke="url(#iconAntiqueGold)" 
          stroke-width="1.5"/>

    <!-- Feather 2 (Emerald Green Accent Plume) -->
    <path d="M 175 395 
             C 155 355 168 315 198 285 
             C 185 310 188 340 205 365 
             C 198 378 188 390 175 395 Z" 
          fill="url(#iconEmerald)" 
          stroke="url(#iconGoldLight)" 
          stroke-width="1.2"/>

    <!-- Central Feather Shaft / Vel Accent -->
    <line x1="210" y1="380" x2="168" y2="280" stroke="url(#iconGoldLight)" stroke-width="2" stroke-linecap="round"/>
    <circle cx="166" cy="275" r="4.5" fill="url(#iconPeacockTeal)" stroke="url(#iconGoldLight)" stroke-width="1.2"/>
  </g>
</svg>`;
}

// 3. Render SVGs and compile high-resolution PNGs using Resvg
export async function buildBrandAssets() {
  console.log('Generating official SKANDA brand assets...');

  const masterSvg = generateMasterLogoSvg();
  const iconSvg = generateSimplifiedIconSvg();

  const brandDir = path.resolve(process.cwd(), 'public', 'brand');
  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }

  // Write SVG files
  fs.writeFileSync(path.join(brandDir, 'skanda-logo.svg'), masterSvg, 'utf8');
  fs.writeFileSync(path.join(brandDir, 'skanda-icon.svg'), iconSvg, 'utf8');
  fs.writeFileSync(path.resolve(process.cwd(), 'public', 'skanda-logo.svg'), iconSvg, 'utf8');
  fs.writeFileSync(path.resolve(process.cwd(), 'public', 'favicon.svg'), iconSvg, 'utf8');

  // Render High-Resolution PNG (1024x1024)
  const masterResvg = new Resvg(masterSvg, {
    fitTo: { mode: 'width', value: 1024 }
  });
  const masterPngData = masterResvg.render();
  const masterPngBuffer = masterPngData.asPng();
  fs.writeFileSync(path.join(brandDir, 'skanda-logo.png'), masterPngBuffer);
  fs.writeFileSync(path.resolve(process.cwd(), 'public', 'skanda-logo.png'), masterPngBuffer);

  // Render Icon PNG (512x512 and 192x192)
  const iconResvg = new Resvg(iconSvg, {
    fitTo: { mode: 'width', value: 512 }
  });
  const iconPngData = iconResvg.render();
  const iconPngBuffer = iconPngData.asPng();
  fs.writeFileSync(path.join(brandDir, 'skanda-icon.png'), iconPngBuffer);
  fs.writeFileSync(path.resolve(process.cwd(), 'public', 'skanda-icon.png'), iconPngBuffer);
  fs.writeFileSync(path.resolve(process.cwd(), 'public', 'apple-touch-icon.png'), iconPngBuffer);

  console.log('Brand assets successfully generated:');
  console.log(' - /public/brand/skanda-logo.svg');
  console.log(' - /public/brand/skanda-logo.png (1024x1024)');
  console.log(' - /public/brand/skanda-icon.svg');
  console.log(' - /public/brand/skanda-icon.png (512x512)');
  console.log(' - /public/skanda-logo.svg & /public/favicon.svg');
}

// Run if called directly
buildBrandAssets().catch((err) => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
