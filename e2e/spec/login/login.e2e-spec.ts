import { LoginPage } from '../../page-objects/login.po';
import { browser } from 'protractor';

describe('CATcher\'s login page', () => {
  let page: LoginPage;

  beforeAll(() => {
    page = new LoginPage();
    page.navigateToRoot();
  });

  it('displays "CATcher" in header bar', async () => {
    expect(await page.getTitle()).toEqual('CATcher');
  });

  it('allows users to authenticate themselves', async () => {
    await page.login();
    expect(await page.getConfirmationScreenTitle()).toEqual('Confirm Login Account');
    await page.confirmUser();
  });
});
