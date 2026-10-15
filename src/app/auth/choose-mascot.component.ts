import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MASCOT_COLORS, MascotColor } from '../shared/mascot.component';

@Component({
  selector: 'app-choose-mascot',
  templateUrl: './choose-mascot.component.html',
  styleUrls: ['./auth-shared.css', './choose-mascot.component.css']
})
export class ChooseMascotComponent {
  avatarOptions = MASCOT_COLORS;
  selected: MascotColor = 'green';
  loading = false;
  error = '';

  constructor(public auth: AuthService, private router: Router) {
    const current = this.auth.user()?.avatarColor;
    if (current) this.selected = current;
  }

  choose(c: MascotColor) {
    this.selected = c;
  }

  continue() {
    this.loading = true;
    this.error = '';
    this.auth.updateAvatarColor(this.selected).subscribe({
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
