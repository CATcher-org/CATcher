import { TestBed } from '@angular/core/testing';

import { PreviewerService } from './previewer.service';

describe('PreviewerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviewerService = TestBed.get(PreviewerService);
    expect(service).toBeTruthy();
  });
});
