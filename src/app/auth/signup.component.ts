import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Gender } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./auth-shared.css']
})
export class SignupComponent {
  name = '';
  email = '';
  password = '';
  gender: Gender | null = null;
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  chooseGender(g: Gender) {
    this.gender = g;
  }

  submit() {
    if (!this.gender) {
      this.error = 'Please select an option so we can greet you correctly.';
      return;
    }
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }
    this.error = '';
    this.loading = true;
    this.auth.signUp(this.name, this.email, this.password, this.gender).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/choose-course');
      },
      error: (message: string) => {
        this.loading = false;
        this.error = message;
      }
    });
  }
}
