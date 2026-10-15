import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../services/theme.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  template: `
    <header class="navbar">
      <div class="navbar-inner container">
        <a routerLink="/" class="brand">
          <img src="assets/logo.webp" alt="EthioLingo logo" class="brand-logo">
          <span>Ethio<b>TrioLingo</b></span>
        </a>

        <nav class="nav-links" *ngIf="auth.isLoggedIn()">
          <a routerLink="/learn" routerLinkActive="active">Courses</a>
          <a routerLink="/vocabulary" routerLinkActive="active">Vocabulary</a>
          <a routerLink="/leaderboard" routerLinkActive="active">Leaderboard</a>
        </nav>

        <div class="nav-right">
          <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-label]="'Toggle dark mode'">
            {{ theme.dark() ? '🌙' : '☀️' }}
          </button>

          <ng-container *ngIf="!auth.isLoggedIn(); else loggedIn">
            <a routerLink="/signup" class="btn btn-purple pill">Sign up</a>
            <a routerLink="/login" class="login-circle" aria-label="Log in">👤</a>
          </ng-container>
          <ng-template #loggedIn>
            <span class="xp-pill">⭐ {{ auth.user()?.xp || 0 }} XP</span>
            <div class="account-menu" [class.open]="menuOpen">
              <button class="login-circle avatar" (click)="toggleMenu($event)" aria-label="Account menu">
                <app-mascot [size]="26" [color]="auth.user()?.avatarColor || 'green'"></app-mascot>
              </button>
              <div class="account-dropdown" *ngIf="menuOpen" (click)="$event.stopPropagation()">
                <p class="account-name">{{ auth.user()?.name }}</p>
                <p class="account-email">{{ auth.user()?.email }}</p>
                <button class="logout-btn" type="button" (click)="logout()">👋 Log out</button>
              </div>
            </div>
          </ng-template>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar { border-bottom: 2px solid var(--border); background: var(--bg); position: sticky; top: 0; z-index: 10; }
    .navbar-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; gap: 12px; }
    .brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; color: var(--ink); white-space: nowrap; }
    .brand-logo { width: 42px; height: 30px; object-fit: cover; border-radius: 6px; transition: transform 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.25); }
    .brand:hover .brand-logo { transform: rotate(-4deg) scale(1.08); }
    .brand:active .brand-logo { transform: rotate(-4deg) scale(0.94); }
    .brand b { color: var(--purple); }
    .nav-links { display: flex; gap: 24px; flex: 1; }
    .nav-links a { font-weight: 700; color: var(--gray); padding: 8px 4px; border-bottom: 3px solid transparent; white-space: nowrap; transition: color 0.15s ease, border-color 0.15s ease, transform 0.1s ease; }
    .nav-links a:hover { color: var(--ink); transform: translateY(-1px); }
    .nav-links a:active { transform: translateY(0); }
    .nav-links a.active { color: var(--ink); border-bottom-color: var(--purple); }
    .nav-right { display: flex; align-items: center; gap: 12px; }
    .theme-toggle {
      background: var(--panel); border: 2px solid var(--border); border-radius: 50%;
      width: 40px; height: 40px; min-width: 40px; font-size: 17px;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease, border-color 0.15s ease;
    }
    .theme-toggle:hover { transform: rotate(20deg) scale(1.08); border-color: var(--purple); }
    .theme-toggle:active { transform: rotate(20deg) scale(0.9); }
    .pill { padding: 10px 20px; font-size: 13px; border-radius: 999px; }
    .login-circle {
      width: 40px; height: 40px; min-width: 40px; border-radius: 50%; background: var(--purple);
      color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; border: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .login-circle.avatar { background: var(--panel); border: 2px solid var(--border); }
    .login-circle:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 6px 14px rgba(124,92,255,0.4); }
    .login-circle:active { transform: translateY(0) scale(0.94); box-shadow: none; }
    .xp-pill { font-weight: 800; color: var(--ink); background: var(--panel); border: 2px solid var(--border); padding: 8px 14px; border-radius: 999px; font-size: 14px; white-space: nowrap; transition: transform 0.15s ease; }
    .xp-pill:hover { transform: scale(1.05); }
    .account-menu { position: relative; }
    .account-dropdown {
      position: absolute; top: calc(100% + 10px); right: 0; z-index: 30; min-width: 200px;
      background: var(--card-bg); border: 2px solid var(--border); border-radius: 16px;
      padding: 14px; box-shadow: 0 12px 28px rgba(0,0,0,0.18);
    }
    .account-name { margin: 0; font-weight: 800; color: var(--ink); font-size: 14px; }
    .account-email { margin: 2px 0 12px; color: var(--gray); font-size: 12px; word-break: break-all; }
    .logout-btn {
      width: 100%; padding: 10px; border-radius: 10px; font-weight: 700; font-size: 14px;
      background: var(--panel); border: 2px solid var(--border); color: var(--ink);
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .logout-btn:hover { border-color: var(--red); color: var(--red); }
    @media (max-width: 720px) { .nav-links { display: none; } }
    @media (max-width: 480px) {
      .navbar-inner { height: 58px; gap: 8px; }
      .brand { font-size: 17px; }
      .brand-logo { width: 34px; height: 24px; }
      .pill { padding: 8px 14px; font-size: 12px; }
      .xp-pill { padding: 6px 10px; font-size: 12px; }
      .theme-toggle, .login-circle { width: 34px; height: 34px; min-width: 34px; font-size: 14px; }
      .account-dropdown { min-width: 170px; }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(public theme: ThemeService, public auth: AuthService, private router: Router) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuOpen = false;
    });
  }

  @HostListener('document:click')
  closeMenu() {
    this.menuOpen = false;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.auth.logOut();
    this.router.navigateByUrl('/');
  }
}
