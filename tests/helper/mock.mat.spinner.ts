export class MockMatSpinner {
  _elementRef = document.createElement('div');
  _document = {
    get: () => null
  };
  _diameter = 0;
  _value = 0;
  _mode = '';

  // Add other properties and methods as needed

  set diameter(value: number) {
    this._diameter = value;
  }

  get diameter(): number {
    return this._diameter;
  }

  set mode(value: string) {
    this._mode = value;
  }

  get mode(): string {
    return this._mode;
  }
}
