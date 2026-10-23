const { By, until } = require('selenium-webdriver');

class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.url = 'https://www.saucedemo.com/';
    this.usernameInput = By.css('[data-test="username"]');
    this.passwordInput = By.css('[data-test="password"]');
    this.loginButton = By.css('[data-test="login-button"]');
    this.errorMessage = By.css('[data-test="error"]');
    this.title = By.css('.title');
  }

  async open() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.loginButton), 10000);
  }

  async login(username, password) {
    await this.driver.findElement(this.usernameInput).sendKeys(username);
    await this.driver.findElement(this.passwordInput).sendKeys(password);
    await this.driver.findElement(this.loginButton).click();
  }

  async getErrorMessage() {
    const el = await this.driver.wait(until.elementLocated(this.errorMessage), 10000);
    await this.driver.wait(until.elementIsVisible(el), 10000);
    return el.getText();
  }

  async getTitle() {
    const el = await this.driver.wait(until.elementLocated(this.title), 10000);
    return el.getText();
  }

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }
}

module.exports = LoginPage;
