import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-illustration',
  template: `
    <svg viewBox="0 0 380 420" xmlns="http://www.w3.org/2000/svg" class="hero-svg">
      <!-- background blob -->
      <path d="M190 20 C300 20 360 100 350 200 C342 290 280 400 180 400 C80 400 20 300 30 190 C38 100 90 20 190 20 Z" fill="var(--purple-light)"/>

      <!-- bookshelf hint -->
      <rect x="40" y="60" width="300" height="70" rx="8" fill="#ffffff" opacity="0.5"/>
      <rect x="55" y="70" width="14" height="50" fill="var(--purple)" opacity="0.5"/>
      <rect x="75" y="70" width="14" height="50" fill="#ff9600" opacity="0.5"/>
      <rect x="95" y="70" width="14" height="50" fill="#1cb0f6" opacity="0.5"/>
      <rect x="115" y="70" width="14" height="50" fill="#58cc02" opacity="0.5"/>

      <!-- person body -->
      <ellipse cx="190" cy="340" rx="80" ry="18" fill="#00000010"/>
      <path d="M140 220 Q190 195 240 220 L250 340 Q190 360 130 340 Z" fill="var(--purple)"/>
      <rect x="150" y="210" width="80" height="40" rx="14" fill="#fff"/>

      <!-- head -->
      <circle cx="190" cy="165" r="48" fill="#8d5a3c"/>
      <path d="M144 150 Q150 100 190 100 Q230 100 236 150 Q236 120 190 118 Q144 120 144 150 Z" fill="#2b1c14"/>
      <circle cx="172" cy="168" r="5" fill="#2b1c14"/>
      <circle cx="208" cy="168" r="5" fill="#2b1c14"/>
      <path d="M175 188 Q190 198 205 188" stroke="#2b1c14" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- book in hands -->
      <g transform="translate(140 250)">
        <rect x="0" y="0" width="100" height="70" rx="6" fill="#ffffff" stroke="var(--purple)" stroke-width="4"/>
        <line x1="50" y1="6" x2="50" y2="64" stroke="var(--purple)" stroke-width="3"/>
        <line x1="10" y1="20" x2="42" y2="20" stroke="#cfcfcf" stroke-width="3"/>
        <line x1="10" y1="32" x2="42" y2="32" stroke="#cfcfcf" stroke-width="3"/>
        <line x1="10" y1="44" x2="42" y2="44" stroke="#cfcfcf" stroke-width="3"/>
        <line x1="58" y1="20" x2="90" y2="20" stroke="#cfcfcf" stroke-width="3"/>
        <line x1="58" y1="32" x2="90" y2="32" stroke="#cfcfcf" stroke-width="3"/>
        <line x1="58" y1="44" x2="90" y2="44" stroke="#cfcfcf" stroke-width="3"/>
      </g>

      <!-- floating letters (Amharic + Latin) -->
      <text x="55" y="220" font-size="26" font-weight="800" fill="var(--purple)">ሀ</text>
      <text x="300" y="180" font-size="24" font-weight="800" fill="#ff9600">A</text>
      <text x="310" y="260" font-size="22" font-weight="800" fill="#1cb0f6">B</text>
      <text x="45" y="290" font-size="22" font-weight="800" fill="#58cc02">ለ</text>
    </svg>
  `,
  styles: [`
    .hero-svg { width: 100%; max-width: 340px; height: auto; display: block; }
  `]
})
export class HeroIllustrationComponent {}
