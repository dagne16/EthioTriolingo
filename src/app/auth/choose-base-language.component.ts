import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, BaseLang } from '../services/auth.service';

@Component({
  selector: 'app-choose-base-language',
  templateUrl: './choose-base-language.component.html',
  styleUrls: ['./auth-shared.css']
})
export class ChooseBaseLanguageComponent {
  /** Step 2 of onboarding. Excludes whichever language was just chosen to learn in step 1 —
   *  can't translate a language into itself. */
  readonly options: { id: BaseLang; label: string; flag: string }[];
  selected: BaseLang;
  loading = false;
  error = '';

  constructor(public auth: AuthService, private router: Router) {
    const allOptions: { id: BaseLang; label: string; flag: string }[] = [
      { id: 'amharic', label: 'Amharic', flag: '🇪🇹' },
      { id: 'oromo', label: 'Afaan Oromo', flag: '🇪🇹' },
      { id: 'tigrigna', label: 'Tigrinya', flag: '🇪🇹' },
      { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
      { id: 'english', label: 'English', flag: '🇺🇸' }
    ];
    const chosenCourse = this.auth.user()?.preferredCourse;
    this.options = allOptions.filter(o => o.id !== chosenCourse);

    const current = this.auth.user()?.baseLanguage;
    this.selected = current && this.options.some(o => o.id === current) ? current : this.options[0].id;
  }

  choose(l: BaseLang) {
    this.selected = l;
  }

  continue() {
    this.loading = true;
    this.error = '';
    this.auth.updateProfile({ baseLanguage: this.selected }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/choose-age');
      },
      error: (message: string) => {
        this.loading = false;
        this.error = message;
      }
    });
  }
}
