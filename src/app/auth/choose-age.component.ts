import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-choose-age',
  templateUrl: './choose-age.component.html',
  styleUrls: ['./auth-shared.css']
})
export class ChooseAgeComponent {
  age: number | null;
  loading = false;
  error = '';

  constructor(public auth: AuthService, private router: Router) {
    this.age = this.auth.user()?.age ?? null;
  }

  continue() {
    if (!this.age || this.age < 5 || this.age > 120) {
      this.error = 'Please enter a valid age (5–120).';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.updateProfile({ age: this.age }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/choose-mascot');
      },
      error: (message: string) => {
        this.loading = false;
        this.error = message;
      }
    });
  }
}
