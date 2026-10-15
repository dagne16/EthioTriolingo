import { Component, Input } from '@angular/core';

export type MascotColor = 'green' | 'blue' | 'purple' | 'pink' | 'orange' | 'teal';

interface Palette { body: string; head: string; wing: string; }

const PALETTES: Record<MascotColor, Palette> = {
  green:  { body: '#58cc02', head: '#7ed957', wing: '#46a302' },
  blue:   { body: '#1cb0f6', head: '#6cd0ff', wing: '#0d8ecf' },
  purple: { body: '#7c5cff', head: '#a690ff', wing: '#5a3fe0' },
  pink:   { body: '#ff5da2', head: '#ff9dc4', wing: '#d6398a' },
  orange: { body: '#ff9600', head: '#ffbb52', wing: '#cc7700' },
  teal:   { body: '#02b3a4', head: '#5adfd2', wing: '#028b7f' }
};

@Component({
  selector: 'app-mascot',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="58" rx="34" ry="30" [attr.fill]="palette.body"/>
      <ellipse cx="50" cy="40" rx="26" ry="24" [attr.fill]="palette.head"/>
      <circle cx="40" cy="38" r="8" fill="#fff"/>
      <circle cx="60" cy="38" r="8" fill="#fff"/>
      <circle cx="41" cy="39" r="3.4" fill="#3c3c3c"/>
      <circle cx="61" cy="39" r="3.4" fill="#3c3c3c"/>
      <path d="M46 48 Q50 53 54 48 Q50 51 46 48 Z" fill="#ff9600"/>
      <path d="M20 55 Q8 50 14 66 Q22 66 26 60 Z" [attr.fill]="palette.wing"/>
      <path d="M80 55 Q92 50 86 66 Q78 66 74 60 Z" [attr.fill]="palette.wing"/>
      <path d="M20 20 Q30 6 40 18 Q30 16 24 26 Z" [attr.fill]="palette.wing"/>
      <path d="M80 20 Q70 6 60 18 Q70 16 76 26 Z" [attr.fill]="palette.wing"/>
    </svg>
  `
})
export class MascotComponent {
  @Input() size = 60;
  @Input() color: MascotColor = 'green';

  get palette(): Palette {
    return PALETTES[this.color] ?? PALETTES.green;
  }
}

export const MASCOT_COLORS: MascotColor[] = ['green', 'blue', 'purple', 'pink', 'orange', 'teal'];
