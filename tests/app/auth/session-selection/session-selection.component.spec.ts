import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ProfilesComponent } from '../../../../src/app/auth/profiles/profiles.component';
import { SessionSelectionComponent } from '../../../../src/app/auth/session-selection/session-selection.component';
import { Profile } from '../../../../src/app/core/models/profile.model';
import { AuthService } from '../../../../src/app/core/services/auth.service';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { GithubService } from '../../../../src/app/core/services/github.service';
import { LoggingService } from '../../../../src/app/core/services/logging.service';
import { PhaseService } from '../../../../src/app/core/services/phase.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';

@Component({
  selector: 'app-profiles',
  template: ''
})
class ProfilesStubComponent implements Partial<ProfilesComponent> {
  @Output() selectedProfileEmitter: EventEmitter<Profile> = new EventEmitter<Profile>();
  @Input() urlEncodedSessionName: string;

  selectProfile(profile: Profile): void {
    this.selectedProfileEmitter.emit(profile);
  }
}

describe('SessionSelectionComponent (unit tests)', () => {
  let fixture: ComponentFixture<SessionSelectionComponent>;
  let component: SessionSelectionComponent;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let profilesDebugEl: DebugElement;
  let profilesComponent: ProfilesComponent;
  let profileEmitter: EventEmitter<Profile>;

  const logger = jasmine.createSpyObj('LoggingService', ['info']);
  const githubService = jasmine.createSpyObj('GithubService', ['storeOrganizationDetails']);
  const phaseService = jasmine.createSpyObj('PhaseService', ['storeSessionData']);
  const authService = jasmine.createSpyObj('AuthService', ['startOAuthProcess', 'changeAuthState']);
  const errorHandlingService = jasmine.createSpyObj('ErrorHandlingService', ['handleError']);

  const testProfile: Profile = {
    profileName: 'testProfile',
    repoName: 'testOrg/pe'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
      declarations: [SessionSelectionComponent, ProfilesStubComponent],
      providers: [
        { provide: LoggingService, useValue: logger },
        { provide: GithubService, useValue: githubService },
        { provide: PhaseService, useValue: phaseService },
        { provide: AuthService, useValue: authService },
        { provide: ErrorHandlingService, useValue: errorHandlingService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SessionSelectionComponent);
    fixture.detectChanges(); // onInit()
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement;
    profilesDebugEl = debugElement.query(By.directive(ProfilesStubComponent));
    profilesComponent = profilesDebugEl.componentInstance;
    profileEmitter = profilesComponent.selectedProfileEmitter;
    spyOn(component.sessionEmitter, 'emit');
  });

  it('renders without errors', () => {
    expect(component).toBeTruthy();
  });

  it('renders the profiles component', () => {
    expect(profilesComponent).toBeTruthy();
  });

  describe('when profile is selected', () => {
    it('should emit the correct repo name', () => {
      profileEmitter.emit(testProfile);
      fixture.detectChanges();
      expect(component.sessionEmitter.emit).toHaveBeenCalledWith(testProfile.repoName);
    });

    it('should update the session input correctly', () => {
      profileEmitter.emit(testProfile);
      fixture.detectChanges();
      const sessionInput = nativeElement.querySelector('input[formcontrolname="session"]');

      if (sessionInput == null) {
        fail('sessionFieldEl should not be null');
        return;
      }
      expect((<HTMLInputElement>sessionInput).value).toBe(testProfile.repoName);
    });
  });
});
