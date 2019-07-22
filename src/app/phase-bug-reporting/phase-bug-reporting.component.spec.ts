import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PhaseBugReportingComponent } from './phase-bug-reporting.component';
import { TranslateModule } from '@ngx-translate/core';

describe('HomeComponent', () => {
  let component: PhaseBugReportingComponent;
  let fixture: ComponentFixture<PhaseBugReportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhaseBugReportingComponent ],
      imports: [
        TranslateModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhaseBugReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
