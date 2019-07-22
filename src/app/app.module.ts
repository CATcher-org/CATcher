import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './shared/layout';
import { AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { PhaseTeamResponseModule } from './phase-team-response/phase-team-response.module';
import { PhaseModerationModule } from './phase-moderation/phase-moderation.module';
import { PhaseBugReportingModule } from './phase-bug-reporting/phase-bug-reporting.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserConfirmationComponent } from './core/guards/user-confirmation/user-confirmation.component';
import { PhaseTesterResponseModule } from './phase-tester-response/phase-tester-response.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserConfirmationComponent
  ],
  imports: [
    BrowserModule,
    PhaseTesterResponseModule,
    BrowserAnimationsModule,
    AuthModule,
    PhaseBugReportingModule,
    PhaseTeamResponseModule,
    PhaseModerationModule,
    SharedModule,
    HttpClientModule,
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          gfm: true,
          tables: true,
          breaks: true,
          pedantic: false,
          sanitize: false,
          smartLists: true,
          smartypants: true,
        },
      },
    }),
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    UserConfirmationComponent
  ]
})
export class AppModule { }
