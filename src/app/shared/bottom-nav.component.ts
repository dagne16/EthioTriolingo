import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  template: `
    <nav class="bottom-nav" *ngIf="visible">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <span class="bn-icon"></span><span class="bn-label">Home</span>
      </a>
      <ng-container *ngIf="auth.isLoggedIn()">
        <a routerLink="/learn" routerLinkActive="active">
          <span class="bn-icon"></span><span class="bn-label">Learn</span>
        </a>
        <a routerLink="/vocabulary" routerLinkActive="active">
          <span class="bn-icon"></span><span class="bn-label">Words</span>
        </a>
        <a routerLink="/leaderboard" routerLinkActive="active">
          <span class="bn-icon"></span><span class="bn-label">Ranks</span>
        </a>
      </ng-container>
      <button type="button" class="bn-logout" *ngIf="auth.isLoggedIn(); else profileLink" (click)="logout()">
        <span class="bn-icon">👋</span><span class="bn-label">Log out</span>
      </button>
      <ng-template #profileLink>
        <a routerLink="/login" routerLinkActive="active">
          <span class="bn-icon"></span><span class="bn-label">Profile</span>
        </a>
      </ng-template>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      display: none;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
      background: var(--bg); border-top: 2px solid var(--border);
      padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
      justify-content: space-around; align-items: center;
    }
    .bottom-nav a, .bottom-nav .bn-logout {
      display: flex; flex-direction: column; align-items: center; gap: 2px;
      color: var(--gray); font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 12px;
      transition: transform 0.12s ease, color 0.12s ease, background 0.12s ease;
      background: none; border: none; font-family: inherit;
    }
    .bottom-nav a:hover, .bottom-nav .bn-logout:hover { color: var(--purple); transform: translateY(-2px); }
    .bottom-nav a:active, .bottom-nav .bn-logout:active { transform: translateY(0) scale(0.9); }
    .bottom-nav a.active { color: var(--purple); background: var(--purple-light); }
    .bottom-nav .bn-logout:hover { color: var(--red); }
    .bn-icon { font-size: 20px; transition: transform 0.12s ease; }
    .bottom-nav a:hover .bn-icon, .bottom-nav .bn-logout:hover .bn-icon { transform: scale(1.15); }
    @media (max-width: 720px) {
      .bottom-nav { display: flex; }
    }
  `]
})
export class BottomNavComponent {
  visible = true;

  constructor(private router: Router, public auth: AuthService) {
    this.update(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      this.update((e as NavigationEnd).urlAfterRedirects);
    });
  }

  private update(url: string) {
    const path = url.split('?')[0].split('#')[0];
    // Hide during active lesson/tense sessions — they have their own bottom action bar.
    this.visible = !(path.startsWith('/lesson/') || path.startsWith('/tenses/'));
  }

  logout() {
    this.auth.logOut();
    this.router.navigateByUrl('/');
  }
}
