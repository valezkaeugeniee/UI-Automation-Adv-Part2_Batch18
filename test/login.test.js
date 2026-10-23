const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const LoginPage = require('../pages/LoginPage');
const { assertVisualMatch } = require('../utils/visual');

const INVALID_CRED_MSG = 'Username and password do not match any user in this service';

describe('Login - SauceDemo', function () {
  let driver;
  let loginPage;

  before(async function () {
    const options = new chrome.Options().addArguments(
      '--headless=new',
      '--window-size=1280,720',
      '--force-device-scale-factor=1'
    );
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  beforeEach(async function () {
    loginPage = new LoginPage(driver);
    await loginPage.open();
  });

  after(async function () {
    await driver.quit();
  });

  // ===== POSITIVE =====
  it('TC01 - Login success with standard_user', async function () {
    await loginPage.login('standard_user', 'secret_sauce');

    expect(await loginPage.getCurrentUrl()).to.include('/inventory.html');
    expect(await loginPage.getTitle()).to.equal('Products');
    await assertVisualMatch(driver, 'login_success');
  });

  // ===== NEGATIVE =====
  it('TC02 - Login failed with invalid username', async function () {
    await loginPage.login('invalid_user', 'secret_sauce');

    expect(await loginPage.getErrorMessage()).to.contain(INVALID_CRED_MSG);
    await assertVisualMatch(driver, 'login_invalid_username');
  });

});
