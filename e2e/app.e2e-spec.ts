import { OctaviaPage } from './app.po';

describe('octavia App', () => {
  let page: OctaviaPage;

  beforeEach(() => {
    page = new OctaviaPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
