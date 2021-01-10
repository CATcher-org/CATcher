import { browser, element, by } from 'protractor';
import { credentials } from '../test.credentials';


export class LoginPage {
  navigateTo(route: string) {
    return browser.get(route);
  }

  getTitle() {
    return element(by.css('app-root')).element(by.css('app-layout-header')).getText();
  }

  getConfirmationScreenTitle() {
    return element(by.className('login-title'));
  }

  async login() {
    await this.selectSession();
    await this.fillCredentials();
    await this.selectWindow(0);
  }

  async confirmUser() {
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

  private async fillCredentials() {
    await browser.waitForAngularEnabled(false);
    await this.selectWindow(1);

    await element(by.name('login')).sendKeys(credentials.username);
    await element(by.name('password')).sendKeys(credentials.password);
    await element(by.name('commit')).click();
    await browser.waitForAngularEnabled(true);
  }

  private async selectWindow(index) {

      // wait for handels[index] to exist
    await browser.driver.wait(function() {
        return browser.driver.getAllWindowHandles().then(function (handles) {
            if(handles.length > index) {
              return true;
            }
          });
      });

      // switch to the window
      return browser.driver.getAllWindowHandles().then(function (handles) {
        return browser.driver.switchTo().window(handles[index]);
      });
    };
}
