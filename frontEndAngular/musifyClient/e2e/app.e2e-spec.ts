import { MusifyClientPage } from './app.po';

describe('musify-client App', function() {
  let page: MusifyClientPage;

  beforeEach(() => {
    page = new MusifyClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
