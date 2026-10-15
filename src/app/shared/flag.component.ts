import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-flag',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" style="border-radius:50%;" [attr.aria-label]="country">
      <clipPath [attr.id]="clipId">
        <circle cx="30" cy="30" r="30"/>
      </clipPath>
      <g [attr.clip-path]="'url(#' + clipId + ')'">
        <ng-container *ngIf="country === 'spain'">
          <rect width="60" height="60" fill="#AA151B"/>
          <rect y="15" width="60" height="30" fill="#F1BF00"/>
        </ng-container>
        <ng-container *ngIf="country === 'usa'">
          <rect width="60" height="60" fill="#fff"/>
          <rect y="0" width="60" height="6" fill="#B22234"/>
          <rect y="12" width="60" height="6" fill="#B22234"/>
          <rect y="24" width="60" height="6" fill="#B22234"/>
          <rect y="36" width="60" height="6" fill="#B22234"/>
          <rect y="48" width="60" height="6" fill="#B22234"/>
          <rect width="28" height="32" fill="#3C3B6E"/>
        </ng-container>
        <ng-container *ngIf="country === 'ethiopia' || country === 'oromia'">
          <rect width="60" height="20" fill="#078930"/>
          <rect y="20" width="60" height="20" fill="#FCDD09"/>
          <rect y="40" width="60" height="20" fill="#DA121A"/>
          <circle cx="30" cy="30" r="9" fill="#0F47AF"/>
        </ng-container>
        <ng-container *ngIf="country === 'tigray'">
          <rect width="60" height="60" fill="#FCDD09"/>
          <rect y="24" width="60" height="12" fill="#DA121A"/>
          <polygon points="30,19 33.2,27.5 42,27.8 34.9,33.3 37.5,41.8 30,36.8 22.5,41.8 25.1,33.3 18,27.8 26.8,27.5" fill="#078930"/>
        </ng-container>
      </g>
    </svg>
  `
})
export class FlagComponent {
  @Input() country: 'spain' | 'usa' | 'ethiopia' | 'oromia' | 'tigray' = 'spain';
  @Input() size = 48;
  get clipId() { return 'clip-' + this.country + Math.random().toString(36).slice(2); }
}
