const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://flexstudent.nu.edu.pk/Login', { timeout: 10000 });

  // Log in
  await page.type('#m_inputmask_4', '-');
  await page.type('#pass', '-');

  // Handle reCAPTCHA
  const frames = await page.frames();
  const recaptchaFrame = frames.find(frame => frame.url().includes('https://www.google.com/recaptcha/api2/anchor'));

  if (recaptchaFrame) {
    const checkbox = await recaptchaFrame.$('.recaptcha-checkbox');
    if (checkbox) {
      await checkbox.click();
      console.log('reCAPTCHA checkbox clicked');
    } else {
      console.log('Could not find the reCAPTCHA checkbox');
    }
  } else {
    console.log('Could not find the reCAPTCHA iframe');
  }

  // Wait for manual captcha solving
  await new Promise(resolve => setTimeout(resolve, 30000));

  await page.click('.m-form__actions #m_login_signin_submit');
  await page.waitForNavigation();

  console.log('Logged in successfully!');

  // Wait for the sidebar to load and click it
  await page.waitForSelector('#m_aside_left', { visible: true });

  // Expand the sidebar menu if necessary
  const menuToggleButton = await page.$('#m_aside_left_offcanvas_toggle');
  if (menuToggleButton) {
    await menuToggleButton.click();
    console.log('Sidebar menu expanded');
  } else {
    console.log('Sidebar menu toggle button not found');
  }

  // Wait for the menu to be visible and interactable
  await page.waitForSelector('.m-menu__nav', { visible: true });

  // Debug: Check the content of the menu
  const menuHtml = await page.evaluate(() => document.querySelector('.m-menu__nav').innerHTML);
  console.log('Menu HTML:', menuHtml);

  // Wait for the specific menu item
  const menuItems = await page.$$('.m-menu__nav > li');
  console.log(`Found ${menuItems.length} menu items.`);

  // Find and click the "Marks" menu item
  const marksMenuItemIndex = 3; // Adjust based on zero-based index
  if (menuItems[marksMenuItemIndex]) {
    const marksMenuItem = await menuItems[marksMenuItemIndex].$('a');
    if (marksMenuItem) {
      await marksMenuItem.click();
      console.log('Clicked on the "Marks" menu item');
    } else {
      console.log('Could not find the "Marks" menu item link');
    }
  } else {
    console.log('Could not find the "Marks" menu item');
  }
  await page.waitForNavigation();

  // Click on the dropdown to open it
  await page.click('#SemId');
  console.log('Dropdown clicked');

  // Wait for the dropdown options to be visible
  await page.waitForSelector('#SemId option');
  
  // Select the second option (Spring 2024)
  const options = await page.$$('#SemId option');
  if (options.length > 1) {
    await options[1].evaluate(option => option.selected = true);
    await page.select('#SemId', '20241'); // Use the value of the second option
    console.log('Selected the second option (Spring 2024)');
  } else {
    console.log('Dropdown options not found');
  }

  // Wait for the content to load or update after selection
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Take a screenshot of the div with the specific id
  const divId = 'CL1004-Quiz'; // Replace with the actual ID of the div you want to capture
  const element = await page.$(`#${divId}`);

  if (element) {
    const boundingBox = await element.boundingBox();
    if (boundingBox) {
      await page.screenshot({
        path: 'Quiz.png',
        clip: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height
        }
      });
      console.log('Screenshot taken and saved as screenshot.png');
    } else {
      console.log('Could not get bounding box for the div');
    }
  } else {
    console.log(`Div with id ${divId} not found`);
  }

  // Continue with your navigation and scraping logic

  await browser.close();
})();
