import { Injectable, signal } from '@angular/core';

export type BaseLanguage = 'amharic' | 'oromo' | 'tigrigna' | 'spanish' | 'english';

@Injectable({ providedIn: 'root' })
export class BaseLanguageService {
  lang = signal<BaseLanguage>(this.readInitial());

  private readInitial(): BaseLanguage {
    const saved = localStorage.getItem('amha_base_lang');
    return saved === 'oromo' ? 'oromo' : saved === 'tigrigna' ? 'tigrigna' : saved === 'spanish' ? 'spanish' : saved === 'english' ? 'english' : 'amharic';
  }

  set(lang: BaseLanguage) {
    this.lang.set(lang);
    localStorage.setItem('amha_base_lang', lang);
  }

  toggle() {
    this.set(this.lang() === 'amharic' ? 'oromo' : 'amharic');
  }
}
