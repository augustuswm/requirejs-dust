var requirejs = require("requirejs");
var should = require('should');

requirejs.config({
  baseUrl: ".",
  paths: {
    "dst": "../require.dust"
  },
  shim: {
    "dust": {
      exports: "dust"
    }
  },
  nodeRequire: require
});

describe("Template Compilation", function() {

  var dst_lib;

  beforeEach(function(done) {
    requirejs(['dst'], function(plugin) {
      dst_lib = plugin;
      done();
    });
  });

  it("both parsers should have same length for simple partials", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>';
    dst_lib.findPartialsRegex(test_template).length.should.equal(dst_lib.findPartialsDust(test_template).length);
  });

  it("both parsers should have same elements for simple partials", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>',
        regexParse = dst_lib.findPartialsRegex(test_template),
        dustParse = dst_lib.findPartialsDust(test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

  it("parse html with regex 1000 times", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>';
    
    for ( var i = 0; i < 1000; i++ )
      var regexParse = dst_lib.findPartialsRegex(test_template);
  });

  it("parse html with dust 1000 times", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>';
    
    for ( var i = 0; i < 1000; i++ )
      var dustParse = dst_lib.findPartialsDust(test_template);
  });

  it("regex should find 6 partials in multiple partial dust template", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    dst_lib.findPartialsRegex(test_template).length.should.equal(6);
  });

  it("dust should find 6 partials in multiple partial dust template", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    dst_lib.findPartialsDust(test_template).length.should.equal(6);
  });

  it("parse mostly dust with regex 1000 times", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    for ( var i = 0; i < 1000; i++ )
      var regexParse = dst_lib.findPartialsRegex(test_template);
  });

  it("parse mostly dust with dust 1000 times", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    for ( var i = 0; i < 1000; i++ )
      var dustParse = dst_lib.findPartialsDust(test_template);
  });

  it("both parsers should have same length for partials with paths", function() {
    var test_template = '{>"path/to/partial"/}';
    dst_lib.findPartialsRegex(test_template).length.should.equal(dst_lib.findPartialsDust(test_template).length);
  });

  it("both parsers should have same elements for partials with paths", function() {
    var test_template = '{>"path/to/partial"/}',
        regexParse = dst_lib.findPartialsRegex(test_template),
        dustParse = dst_lib.findPartialsDust(test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

  it("both parsers should have same length for dynamic partials", function() {
    var test_template = '{>"dynaviews/dyna{viewname}"/}';
    dst_lib.findPartialsRegex(test_template).length.should.equal(dst_lib.findPartialsDust(test_template).length);
  });

  it("both parsers should have same elements for dynamic partials", function() {
    var test_template = '{>"dynaviews/dyna{viewname}"/}',
        regexParse = dst_lib.findPartialsRegex(test_template),
        dustParse = dst_lib.findPartialsDust(test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

  it("both parsers should have same length for partials with parameters", function() {
    var test_template = '{>partial parameter=thingy/}';
    dst_lib.findPartialsRegex(test_template).length.should.equal(dst_lib.findPartialsDust(test_template).length);
  });

  it("both parsers should have same elements for partials with parameters", function() {
    var test_template = '{>partial parameter=thingy/}',
        regexParse = dst_lib.findPartialsRegex(test_template),
        dustParse = dst_lib.findPartialsDust(test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

});