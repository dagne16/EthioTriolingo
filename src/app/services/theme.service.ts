import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  dark = signal<boolean>(this.readInitial());

  private readInitial(): boolean {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  constructor() {
    this.apply(this.dark());
  }

  toggle() {
    this.set(!this.dark());
  }

  set(isDark: boolean) {
    this.dark.set(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.apply(isDark);
  }

  private apply(isDark: boolean) {
    document.documentElement.classList.toggle('dark-theme', isDark);
  }
}
