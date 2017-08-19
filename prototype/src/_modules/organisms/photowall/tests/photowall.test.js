'use strict';

import Photowall from '../photowall';

describe('Photowall View', function() {

  beforeEach(() => {
    this.photowall = new Photowall();
  });

  it('Should run a few assertions', () => {
    expect(this.photowall);
  });

});
