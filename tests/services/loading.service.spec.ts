import { LoadingService } from '../../src/app/core/services/loading.service';

describe('LoadingService', () => {
  describe('.show()', () => {
    it('returns a value which indicate that the component is to be loading', () => {
      const loader = new LoadingService();
      loader.show().subscribe((isLoading) => expect(isLoading).toBe(true));
    });
  });

  describe('.hide()', () => {
    it('returns a value which indicates that the component is not to be loading', () => {
      const loader = new LoadingService();
      loader.hide().subscribe((isLoading) => expect(isLoading).toBe(false));
    });
  });

  describe('.show() and .show()', () => {
    it('returns a value which indicates that the component is still to be loading', () => {
      const loader = new LoadingService();
      loader
        .show()
        .pipe(() => loader.show())
        .subscribe((isLoading) => expect(isLoading).toBe(true));
    });
  });

  describe('.hide() and .hide()', () => {
    it('returns a value which indicates that the component is still to be loading', () => {
      const loader = new LoadingService();
      loader
        .hide()
        .pipe(() => loader.hide())
        .subscribe((isLoading) => expect(isLoading).toBe(false));
    });
  });

  describe('.show() and .hide()', () => {
    it('returns a value which indicates that the component is still to be loading', () => {
      const loader = new LoadingService();
      loader
        .show()
        .pipe(() => loader.hide())
        .subscribe((isLoading) => expect(isLoading).toBe(false));
    });
  });

  describe('.hide() and .show()', () => {
    it('returns a value which indicates that the component is still to be loading', () => {
      const loader = new LoadingService();
      loader
        .hide()
        .pipe(() => loader.show())
        .subscribe((isLoading) => expect(isLoading).toBe(true));
    });
  });
});
