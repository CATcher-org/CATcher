import { LoginPage } from './page-objects/login.po';

describe('CATcher\'s login page', () => {
  let page: LoginPage;

  beforeEach(() => {
    page = new LoginPage();
  });

  it('displays "CATcher" in header bar', async () => {
    page.navigateTo('/');
    expect(await page.getTitle()).toEqual('CATcher');
  });

  it('allows users to authenticate themselves', async () => {
    page.navigateTo('/');
    await page.login();
    expect(await page.getConfirmationScreenTitle()).toEqual('Confirm Login Account');
    await page.confirmUser();
  });
});
