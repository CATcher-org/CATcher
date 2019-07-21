import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuePendingComponent } from './issue-pending.component';

describe('IssuePendingComponent', () => {
  let component: IssuePendingComponent;
  let fixture: ComponentFixture<IssuePendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssuePendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuePendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
