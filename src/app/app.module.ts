import 'reflect-metadata';
import '../polyfills';
import { BrowserModule, Title } from '@angular/platform-browser';
import { ErrorHandler, NgModule, NgZone } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './shared/layout';
import { AuthModule } from './auth/auth.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PhaseTeamResponseModule } from './phase-team-response/phase-team-response.module';
import { PhaseModerationModule } from './phase-moderation/phase-moderation.module';
import { PhaseBugReportingModule } from './phase-bug-reporting/phase-bug-reporting.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserConfirmationComponent } from './core/guards/user-confirmation/user-confirmation.component';
import { LabelDefinitionPopupComponent } from './shared/label-definition-popup/label-definition-popup.component';
import { PhaseTesterResponseModule } from './phase-tester-response/phase-tester-response.module';
import { SessionFixConfirmationComponent } from './core/services/session-fix-confirmation/session-fix-confirmation.component';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { AuthService } from './core/services/auth.service';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { Apollo, ApolloModule } from 'apollo-angular';
import graphqlTypes from '../../graphql/graphql-types';
import { GithubService } from './core/services/github.service';
import { ErrorHandlingService } from './core/services/error-handling.service';
import { ElectronService } from './core/services/electron.service';
import { GithubServiceFactory } from './core/services/factories/factory.github.service';
import { AuthServiceFactory } from './core/services/factories/factory.auth.service';
import { Router } from '@angular/router';
import { UserService } from './core/services/user.service';
import { IssueService } from './core/services/issue.service';
import { PhaseService } from './core/services/phase.service';
import { LabelService } from './core/services/label.service';
import { DataService } from './core/services/data.service';
import { GithubEventService } from './core/services/githubevent.service';
import { LoggingService } from './core/services/logging.service';
import { IssueServiceFactory } from './core/services/factories/factory.issue.service';
import { PermissionService } from './core/services/permission.service';
import { markedOptionsFactory } from './shared/lib/marked';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserConfirmationComponent,
    LabelDefinitionPopupComponent,
    SessionFixConfirmationComponent
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
        useFactory: markedOptionsFactory
      },
    }),
    AppRoutingModule,
    ApolloModule,
    HttpLinkModule,
  ],
  providers: [
    {
      provide: GithubService,
      useFactory: GithubServiceFactory,
      deps: [ErrorHandlingService, Apollo, ElectronService]
    },
    {
      provide: AuthService,
      useFactory: AuthServiceFactory,
      deps: [ElectronService, Router, NgZone, HttpClient,
      ErrorHandlingService, GithubService, UserService,
      IssueService, PhaseService, LabelService, DataService,
      GithubEventService, Title, LoggingService]
    },
    {
      provide: IssueService,
      useFactory: IssueServiceFactory,
      deps: [GithubService, UserService, PhaseService,
      PermissionService, ErrorHandlingService, ElectronService, DataService]
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlingService
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    UserConfirmationComponent,
    SessionFixConfirmationComponent,
    LabelDefinitionPopupComponent
  ]
})

export class AppModule {
  constructor(private apollo: Apollo, private httpLink: HttpLink, private authService: AuthService) {

    const URI = 'https://api.github.com/graphql';
    const basic = setContext(() => {
      return { headers: {Accept: 'charset=utf-8' }};
    });
    const auth = setContext(() => {
      return { headers: { Authorization: `Token ${this.authService.accessToken.getValue()}` } };
    });
    const link = ApolloLink.from([basic, auth, this.httpLink.create({ uri: URI })]);
    const fragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: graphqlTypes
    });
    const cache = new InMemoryCache({ fragmentMatcher });
    apollo.create({
      link: link,
      cache: cache,
    });
  }
}
