import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './shared/layout';
import {IssueModule } from './issue/issue.module';
import {AuthModule } from './auth/auth.module';
import { HttpClientModule } from '@angular/common/http';
import { TutorModule } from './tutor/tutor.module';

@NgModule({
  declarations: [
    AppComponent, HeaderComponent
  ],
  imports: [
    BrowserModule,
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
    HomeModule,
    IssueModule,
    AuthModule,
    SharedModule,
    AppRoutingModule,
    TutorModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
