import { Injectable, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

interface ServerProgressRow {
  courseId: string;
  unitId: string;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  // key: `${courseId}:${unitId}` -> true
  completed = signal<Record<string, boolean>>({});
  private lastSyncedUserId: number | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.completed.set(this.readLocal());

    // Whenever the logged-in user changes, pull their saved progress from the server
    // and merge it with whatever's cached locally.
    effect(() => {
      const user = this.auth.user();
      if (user && user.id !== this.lastSyncedUserId) {
        this.lastSyncedUserId = user.id;
        this.completed.set(this.readLocal()); // switch to this user's local cache first
        this.syncFromServer();
      } else if (!user) {
        this.lastSyncedUserId = null;
        this.completed.set(this.readLocal());
      }
    });
  }

  private storageKey(): string {
    const user = this.auth.user();
    return user ? `amha_progress_${user.id}` : 'amha_progress_guest';
  }

  private readLocal(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(this.storageKey());
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private persistLocal() {
    localStorage.setItem(this.storageKey(), JSON.stringify(this.completed()));
  }

  private key(courseId: string, unitId: string): string {
    return `${courseId}:${unitId}`;
  }

  isComplete(courseId: string, unitId: string): boolean {
    return !!this.completed()[this.key(courseId, unitId)];
  }

  markComplete(courseId: string, unitId: string) {
    this.completed.update(c => ({ ...c, [this.key(courseId, unitId)]: true }));
    this.persistLocal();

    if (this.auth.isLoggedIn()) {
      this.http.post(`${environment.apiUrl}/progress`, { courseId, unitId }).subscribe({
        error: () => { /* saved locally; will be picked up on next successful sync */ }
      });
    }
  }

  /** A unit is unlocked if it's the first unit, or the previous unit in the list is complete. */
  isUnlocked(courseId: string, unitIds: string[], index: number): boolean {
    if (index === 0) return true;
    return this.isComplete(courseId, unitIds[index - 1]);
  }

  private syncFromServer() {
    this.http.get<{ progress: ServerProgressRow[] }>(`${environment.apiUrl}/progress`).subscribe({
      next: (res) => {
        const merged = { ...this.completed() };
        for (const p of res.progress) {
          merged[this.key(p.courseId, p.unitId)] = true;
        }
        this.completed.set(merged);
        this.persistLocal();
      },
      error: () => { /* offline or request failed — keep using the local cache */ }
    });
  }
}
