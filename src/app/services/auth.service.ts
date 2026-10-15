import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseLanguageService } from './base-language.service';
import { MascotColor } from '../shared/mascot.component';

export type Gender = 'female' | 'male' | 'other';
export type CourseId = 'spanish' | 'english' | 'oromo' | 'amharic' | 'tigrigna';
export type BaseLang = 'amharic' | 'oromo' | 'tigrigna' | 'spanish' | 'english';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  gender: Gender;
  preferredCourse: CourseId;
  baseLanguage: BaseLang;
  avatarColor: MascotColor;
  age: number | null;
  xp: number;
}

interface AuthResponse {
  token: string;
  user: AppUser;
}

const TOKEN_KEY = 'ethiolingo_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<AppUser | null>(null);
  /** True once the initial "am I already logged in?" check has resolved. */
  ready = signal<boolean>(false);
  /** Resolves once `ready` becomes true — handy for route guards that must wait for session restore. */
  readonly readyPromise: Promise<void>;
  private resolveReady!: () => void;

  constructor(private http: HttpClient, private baseLanguage: BaseLanguageService) {
    this.readyPromise = new Promise<void>(resolve => { this.resolveReady = resolve; });
    this.restoreSession();
  }

  private get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  /** On app load, if a token is stored, fetch the current user to restore the session. */
  private restoreSession() {
    const token = this.token;
    if (!token) {
      this.ready.set(true);
      this.resolveReady();
      return;
    }
    this.http.get<{ user: AppUser }>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (res) => {
        this.user.set(res.user);
        this.baseLanguage.set(res.user.baseLanguage);
        this.ready.set(true);
        this.resolveReady();
      },
      error: () => {
        // Token invalid/expired — clear it silently.
        this.setToken(null);
        this.ready.set(true);
        this.resolveReady();
      }
    });
  }

  /** Gender + auth fields are the only things collected on the signup form itself —
   *  base language, preferred course, and mascot are each chosen on their own page
   *  right after the account is created (see the choose-* routes). */
  signUp(name: string, email: string, password: string, gender: Gender): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, {
      name, email, password, gender
    }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.user.set(res.user);
        this.baseLanguage.set(res.user.baseLanguage);
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.friendlyError(err)))
    );
  }

  /** Used on the post-signup "choose your course / base language / age / mascot" pages. */
  updateProfile(partial: Partial<{ name: string; avatarColor: MascotColor; preferredCourse: CourseId; baseLanguage: BaseLang; age: number }>): Observable<AppUser> {
    return this.http.patch<{ user: AppUser }>(`${environment.apiUrl}/auth/me`, partial).pipe(
      map(res => res.user),
      tap(user => {
        this.user.set(user);
        if (partial.baseLanguage) this.baseLanguage.set(user.baseLanguage);
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.friendlyError(err)))
    );
  }

  /** Thin wrapper kept for the mascot page's existing call site. */
  updateAvatarColor(avatarColor: MascotColor): Observable<AppUser> {
    return this.updateProfile({ avatarColor });
  }

  logIn(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        this.setToken(res.token);
        this.user.set(res.user);
        this.baseLanguage.set(res.user.baseLanguage);
      }),
      catchError((err: HttpErrorResponse) => throwError(() => this.friendlyError(err)))
    );
  }

  logOut(): void {
    this.setToken(null);
    this.user.set(null);
  }

  addXp(amount: number): void {
    if (!this.user()) return;
    this.http.post<{ user: AppUser }>(`${environment.apiUrl}/auth/me/xp`, { amount }).subscribe({
      next: (res) => this.user.set(res.user),
      error: () => { /* non-critical; XP will resync next load */ }
    });
  }

  isLoggedIn(): boolean {
    return !!this.user();
  }

  private friendlyError(err: HttpErrorResponse): string {
    // Our API returns { error: "message" }, but proxies/hosts (Vercel, Render) can return
    // { error: { code, message } } or plain HTML — never assume it is a string.
    const body: any = err.error;
    const raw = body?.error ?? body?.message ?? body;
    if (typeof raw === 'string' && raw.trim() && !raw.trim().startsWith('<')) return raw;
    if (raw && typeof raw === 'object' && typeof raw.message === 'string') return raw.message;

    if (err.status === 0) return "Can't reach the server. Check your internet connection and try again.";
    if (err.status === 502 || err.status === 503 || err.status === 504) {
      return 'The server is waking up. Please wait a few seconds and try again.';
    }
    return 'Something went wrong. Please try again.';
  }
}
