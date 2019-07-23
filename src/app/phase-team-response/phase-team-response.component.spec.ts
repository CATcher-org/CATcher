import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhaseTeamResponseComponent } from './phase-team-response.component';

describe('PhaseTeamResponseComponent', () => {
  let component: PhaseTeamResponseComponent;
  let fixture: ComponentFixture<PhaseTeamResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseTeamResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseTeamResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
