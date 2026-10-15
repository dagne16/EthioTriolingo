import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

interface LeaderRow {
  rank: number;
  id: number;
  name: string;
  xp: number;
  isMe?: boolean;
}

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {
  rows = signal<LeaderRow[]>([]);
  loading = signal<boolean>(true);
  loadError = signal<boolean>(false);

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit(): void {
    this.fetchLeaderboard();
  }

  private fetchLeaderboard() {
    this.loading.set(true);
    this.loadError.set(false);
    this.http.get<{ leaderboard: { rank: number; id: number; name: string; xp: number }[] }>(
      `${environment.apiUrl}/leaderboard?limit=25`
    ).subscribe({
      next: (res) => {
        const me = this.auth.user();
        const rows = res.leaderboard.map(r => ({
          ...r,
          isMe: !!me && r.id === me.id
        }));
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      }
    });
  }

  retry() {
    this.fetchLeaderboard();
  }

  get myRank(): number | null {
    const mine = this.rows().find(r => r.isMe);
    return mine ? mine.rank : null;
  }
}
