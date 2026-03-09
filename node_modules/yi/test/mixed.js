var yi = require('../index');
var should = require('should');

describe('mix merge and clone', function () {

  it('a case from tailbone', function () {
    var mainAppSettings = {
      viewMount       : '',
      mount           : '',
      pageTitle       : 'main app',
      header          : '<center><h1><a href="/">Main app</a></h1></center>',
      footer          : '<center>copyright 2014</center>',
      needJquery      : true,
      needBootstrap   : true,
      needFontAwesome : true,
      imagesMap       : {
        '404': '404.png',
        '500': 'http://www.google.com/images/errors/robot.png'
      }
    };
    var subAppSettings = yi.merge({
      pageTitle: 'sub app',
      viewMount: '/sub',
      header: '<center><h1><a href="/">Sub app</a></h1></center>',
    }, yi.clone(mainAppSettings));

    mainAppSettings.should.have.property('pageTitle', 'main app');
    mainAppSettings.should.have.property('viewMount', '');

    subAppSettings.should.have.property('pageTitle', 'sub app');
    subAppSettings.should.have.property('viewMount', '/sub');

    subAppSettings.imagesMap.should.eql(mainAppSettings.imagesMap);

  });

});

