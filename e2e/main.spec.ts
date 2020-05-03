import {SpectronClient} from 'spectron';

import commonSetup from './common-setup';

describe('CATcher App', function () {
  commonSetup.apply(this);

  let browser: any;
  let client: SpectronClient;

  beforeEach(function () {
    client = this.app.client;
    browser = client as any;
  });

  it('creates one window', async function () {
    const count = await client.getWindowCount();
    expect(count).toEqual(1);
  });

  it('display CATcher Logo on toolbar', async function () {
    const text = await browser.getText('app-layout-header mat-toolbar');
    expect(text).toEqual('CATcher');
  });
});
