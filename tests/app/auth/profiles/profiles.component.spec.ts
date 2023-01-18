import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ProfilesComponent } from '../../../../src/app/auth/profiles/profiles.component';
import { Profile } from '../../../../src/app/core/models/profile.model';
import { ErrorHandlingService } from '../../../../src/app/core/services/error-handling.service';
import { ProfileService } from '../../../../src/app/core/services/profile.service';
import { SharedModule } from '../../../../src/app/shared/shared.module';

@Component({
  template: `<app-profiles (selectedProfileEmitter)="onSelected($event)"> </app-profiles>`
})
class TestHostComponent {
  selectedProfile: Profile | undefined;
  onSelected(profile: Profile) {
    this.selectedProfile = profile;
  }
}

describe('ProfilesComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let debugElement: DebugElement;
  let nativeElement: HTMLElement;
  let testHost: TestHostComponent;
  let profilesEl: HTMLElement;

  const profileService = jasmine.createSpyObj('ProfileService', ['fetchExternalProfiles']);
  const errorHandlingService = jasmine.createSpyObj('ErrorHandlingService', ['handleError']);

  const testProfiles: Profile[] = [
    {
      profileName: 'testProfile1',
      repoName: 'test-org1/pe'
    },
    {
      profileName: 'testProfile2',
      repoName: 'test-org2/pe'
    },
    {
      profileName: 'testProfile3',
      repoName: 'test-org3/pe'
    }
  ];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, SharedModule],
      declarations: [ProfilesComponent, TestHostComponent],
      providers: [
        { provide: ProfileService, useValue: profileService },
        { provide: ErrorHandlingService, useValue: errorHandlingService }
      ]
    }).compileComponents();
  }));

  beforeEach(fakeAsync(() => {
    profileService.fetchExternalProfiles.and.returnValue(Promise.resolve(testProfiles));

    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;

    debugElement = fixture.debugElement;
    nativeElement = debugElement.nativeElement;
    profilesEl = <HTMLElement>nativeElement.querySelector('app-profiles');

    fixture.detectChanges(); // onInit()
    tick(); // wait for profiles to be loaded
  }));

  it('should display the correct profiles from AppConfig', () => {
    openMatSelect();
    const displayedOptions = getOptions();

    displayedOptions.slice(1).forEach((el, i) => {
      const optionTextEl = <HTMLElement>el.querySelector('.mat-option-text');
      if (!optionTextEl) {
        fail('optionTextEl should not be null');
      }
      const profileName = optionTextEl.innerText;
      expect(profileName).toBe(testProfiles[i].profileName);
    });
  });

  it('should emit the correct profile through selectProfile when mat-option is clicked', () => {
    openMatSelect();
    const displayedOptions = getOptions();

    displayedOptions[3].click();
    expect(testHost.selectedProfile).toEqual(testProfiles[2]);
    fixture.detectChanges();
  });

  function openMatSelect(): void {
    const select = <HTMLElement>profilesEl.querySelector('.mat-select');
    if (!select) {
      fail('Select should not be null');
    }
    select.click();
    fixture.detectChanges();
  }

  function getOptions(): HTMLElement[] {
    return Array.from(document.querySelectorAll('.mat-option'));
  }
});
