import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhaseTesterResponseComponent } from './phase-tester-response.component';

describe('PhaseTesterResponseComponent', () => {
  let component: PhaseTesterResponseComponent;
  let fixture: ComponentFixture<PhaseTesterResponseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseTesterResponseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseTesterResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
