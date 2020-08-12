const Application = require('spectron').Application;
const electronPath = require('electron');

export default function setup() {
  /**
   * Will Open Electron application before testing begins.
   */
  beforeEach(async function () {
    this.app = new Application({
      path: electronPath,
      args: ['.'],
    });

    await this.app.start();
    const browser = this.app.client;
    await browser.waitUntilWindowLoaded();
    browser.timeouts('script', 15000);
  });

  /**
   * Will close the Electron application after testing.
   */
  afterEach(async function () {
    if (this.app && this.app.isRunning()) {
      await this.app.stop();
    }
  });
}
