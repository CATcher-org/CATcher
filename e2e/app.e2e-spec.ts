import { LoginPage } from './app.po';
import { browser, element, by } from 'protractor';

describe("CATcher's login page", () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('displays "CATcher" in header bar', () => {
    page.navigateTo('/');
    expect(page.getTitle()).toEqual('CATcher');
  });

  it('allows users to authenticate themselves', async () => {
    page.navigateTo('/');
    await page.login();
    expect(page.getConfirmationScreenTitle()).toEqual('Confirm Login Account');
    await page.confirmUser();
  });
});
