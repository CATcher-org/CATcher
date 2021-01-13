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
import { SessionFixConfirmationComponent } from './core/services/session-fix-confirmation/session-fix-confirmation.component';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { AuthService } from './core/services/auth.service';
import { setContext } from 'apollo-link-context';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { Apollo, ApolloModule } from 'apollo-angular';
import graphqlTypes from '../../graphql/graphql-types';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UserConfirmationComponent,
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
    ApolloModule,
    HttpLinkModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    UserConfirmationComponent,
    SessionFixConfirmationComponent
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
