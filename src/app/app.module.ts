import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LearnComponent } from './learn/learn.component';
import { LessonComponent } from './lesson/lesson.component';
import { NavbarComponent } from './shared/navbar.component';
import { MascotComponent } from './shared/mascot.component';
import { FlagComponent } from './shared/flag.component';
import { HeroIllustrationComponent } from './shared/hero-illustration.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { LoginComponent } from './auth/login.component';
import { SignupComponent } from './auth/signup.component';
import { ChooseMascotComponent } from './auth/choose-mascot.component';
import { ChooseBaseLanguageComponent } from './auth/choose-base-language.component';
import { ChooseCourseComponent } from './auth/choose-course.component';
import { ChooseAgeComponent } from './auth/choose-age.component';
import { VocabularyComponent } from './vocabulary/vocabulary.component';
import { TenseComponent } from './tense/tense.component';
import { BottomNavComponent } from './shared/bottom-nav.component';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LearnComponent,
    LessonComponent,
    NavbarComponent,
    MascotComponent,
    FlagComponent,
    HeroIllustrationComponent,
    LeaderboardComponent,
    LoginComponent,
    SignupComponent,
    ChooseMascotComponent,
    ChooseBaseLanguageComponent,
    ChooseCourseComponent,
    ChooseAgeComponent,
    VocabularyComponent,
    TenseComponent,
    BottomNavComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
