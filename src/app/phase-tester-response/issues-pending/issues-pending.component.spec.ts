import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesPendingComponent } from './issues-pending.component';

describe('IssuesPendingComponent', () => {
  let component: IssuesPendingComponent;
  let fixture: ComponentFixture<IssuesPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuesPendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
