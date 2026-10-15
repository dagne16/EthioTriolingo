import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface FeatureTab {
  icon: string;
  title: string;
  desc: string;
  detail: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  /** Which form the embedded auth widget starts on — driven by route data so
   *  /signup and /login (and navbar links to them) land on the right tab,
   *  while everything still lives on this one description+auth page. */
  authMode: 'signup' | 'login' = 'signup';

  bottomFeatures: FeatureTab[] = [
    {
      icon: '🗣️',
      title: 'Amharic ,Tigirigna and, Afaan Oromo',
      desc: 'Choose the language you\'re most comfortable in — every lesson is explained from either.',
      detail: 'No middleman language, and no single default either. Switch between Amharic ,Tigirigna and Afaan Oromo any time from the Learn page — every word, phrase, and grammar explanation is fully available in both, with pronunciation hints.'
    },
    {
      icon: '🌍',
      title: 'Three Languages, One App',
      desc: 'Learn Spanish and English side by side, at your own pace, in the same place.',
      detail: 'Switch freely between the Spanish and English tracks from the Learn page. Progress, XP, and your leaderboard rank are shared across both, so you can study whichever language fits your mood that day.'
    },
    {
      icon: '📱',
      title: 'Learn Anywhere',
      desc: 'Bite-size lessons that fit into a coffee break, a commute, or a quiet evening.',
      detail: 'Each lesson is just 5 quick questions — a couple of minutes, start to finish. Hearts and streaks keep you motivated to come back daily, even on your busiest days.'
    }
  ];

  activeFeature = 0;

  constructor(private route: ActivatedRoute, public auth: AuthService) {
    const mode = this.route.snapshot.data['authMode'];
    if (mode === 'login' || mode === 'signup') {
      this.authMode = mode;
    }
  }

  selectFeature(i: number) {
    this.activeFeature = this.activeFeature === i ? -1 : i;
  }
}
