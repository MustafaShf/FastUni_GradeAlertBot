const puppeteer = require("puppeteer");
const xlsx=require("xlsx");



(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto("https://books.toscrape.com/");

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  const options = await page.$$eval(
    ".product_pod .image_container a",
    (aLinks) => {
      return aLinks.map((link) => link.href);
    }
  );
  
  let aoa=options.map((aLink)=>[aLink]);

    let book=xlsx.utils.book_new()
    let sheet=xlsx.utils.aoa_to_sheet(aoa);
    xlsx.utils.book_append_sheet(book,sheet);
  xlsx.writeFile(book,'scrap.xlsx')


  //await browser.close();
})();
