import { by, element } from 'protractor';

export class Header {

  async clickBackButton() {
    return element(by.className('back-button')).click();
  }
}
