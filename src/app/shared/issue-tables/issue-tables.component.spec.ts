import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueTablesComponent } from './issue-tables.component';

describe('IssueTablesComponent', () => {
  let component: IssueTablesComponent;
  let fixture: ComponentFixture<IssueTablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IssueTablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IssueTablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
