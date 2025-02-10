import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesPostedComponent } from './issues-posted.component';

describe('IssuesPostedComponent', () => {
  let component: IssuesPostedComponent;
  let fixture: ComponentFixture<IssuesPostedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssuesPostedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesPostedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
