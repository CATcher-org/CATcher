import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhaseModerationComponent } from './phase-moderation.component';

describe('PhaseModerationComponent', () => {
  let component: PhaseModerationComponent;
  let fixture: ComponentFixture<PhaseModerationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseModerationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseModerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
