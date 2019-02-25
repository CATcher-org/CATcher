import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Phase1Component } from './home.component';
import { TranslateModule } from '@ngx-translate/core';

describe('HomeComponent', () => {
  let component: Phase1Component;
  let fixture: ComponentFixture<Phase1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Phase1Component ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Phase1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
