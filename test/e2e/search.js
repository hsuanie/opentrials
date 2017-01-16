'use strict';

const webdriver = require('selenium-webdriver');
const should = require('should');

const By = webdriver.By;
const until = webdriver.until;


describe('(e2e) search', () => {
  let SERVER_URL;
  let driver;
  this.timeout(60000);

  before(() => {
    SERVER_URL = getServerUrl();
    driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.firefox())
      .build();
  });

  after(() => {
    driver.close();
  });

  it('should work through the basic search flow', () => {
    driver.get(SERVER_URL);
    driver.findElement(By.css('.search-bar input')).submit();
    driver.findElement(By.css('.search-results .title a')).click();
    return driver.getCurrentUrl()
      .then((url) => should(url).match(/\/trials\//));
  });

  it('should work with all search filters enabled', () => {
    driver.get(SERVER_URL);

    driver.findElement(By.css('.search-controls button')).click();

    driver.findElement(By.name('q')).sendKeys('query');
    driver.findElements(By.css('.select2-container input'))
      .then((elements) => elements.reduce((resolved, el) => resolved
            .then(() => el.click())
            .then(() => driver.wait(until.elementLocated(By.css('.select2-results__option--highlighted'))))
            .then((option) => option.click()), Promise.resolve()));
    driver.findElement(By.name('sample_size_start')).sendKeys(10);
    driver.findElement(By.name('sample_size_end')).sendKeys(100);
    driver.findElement(By.name('registration_date_start')).sendKeys('2015-01-01');
    driver.findElement(By.name('registration_date_end')).sendKeys('2016-01-01');
    // This is a hacky way of selecting an option in a select box. Please fix
    // it if you find a better way.
    driver.findElement(By.name('gender')).sendKeys(webdriver.Key.PAGE_DOWN);
    driver.findElement(By.name('has_published_results')).sendKeys(webdriver.Key.PAGE_DOWN);
    driver.findElement(By.name('has_discrepancies')).sendKeys(webdriver.Key.PAGE_DOWN);

    driver.findElement(By.css('.search-bar input')).submit();

    return driver.wait(until.titleIs('Search'));
  });
});
