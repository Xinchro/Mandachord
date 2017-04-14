import { MandachordPage } from './app.po';

describe('Mandachord App', () => {
  let page: MandachordPage;

  beforeEach(() => {
    page = new MandachordPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
