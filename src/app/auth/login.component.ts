import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./auth-shared.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in both fields.';
      return;
    }
    this.error = '';
    this.loading = true;
    this.auth.logIn(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/learn');
      },
      error: (message: string) => {
        this.loading = false;
        this.error = message;
      }
    });
  }
}
