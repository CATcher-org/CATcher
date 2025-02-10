import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuesDeletedComponent } from './issues-deleted.component';

describe('IssuesDeletedComponent', () => {
  let component: IssuesDeletedComponent;
  let fixture: ComponentFixture<IssuesDeletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssuesDeletedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IssuesDeletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
