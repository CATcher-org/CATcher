import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueRespondedComponent } from './issue-responded.component';

describe('IssueRespondedComponent', () => {
  let component: IssueRespondedComponent;
  let fixture: ComponentFixture<IssueRespondedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueRespondedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueRespondedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
