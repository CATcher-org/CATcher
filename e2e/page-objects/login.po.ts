import { browser, element, by, ExpectedConditions } from 'protractor';

export class LoginPage {
  navigateToRoot() {
    return browser.get('/');
  }

  async getTitle() {
    return element(by.css('app-root')).element(by.css('app-layout-header')).getText();
  }

  async getConfirmationScreenTitle() {
    return element(by.className('login-title')).getText();
  }

  async login() {
    await this.selectSession();
  }

  async confirmUser() {
    await browser.wait(ExpectedConditions.presenceOf(element(by.className('sign-in-button'))));
    const confirm = element(by.className('sign-in-button'));
    await confirm.click();
  }

  private async selectSession() {
    const profiles = element(by.css('app-root')).element(by.css('app-profiles'));

    await profiles.click();
    const options = element.all(by.className('mat-option')).get(1);
    await options.click();

    const button = element(by.className('sign-in-button'));
    await button.click();
  }

  async bypassAuthentication() {
    await this.login();
    await this.confirmUser();
  }
}
