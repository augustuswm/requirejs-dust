describe("Template Parsing", function() {

  var dst_lib, requirejs = require("requirejs"), should = require("should");

  before(function() {
    requirejs.config({
      baseUrl: ".",
      paths: {
        "dst": "../require.dust",
        "dust": "dust.full"
      },
      shim: {
        "dust": {
          exports: "dust"
        }
      }
    });
  });

  beforeEach(function(done) {
    requirejs(['dst'], function(plugin) {
      dst_lib = plugin;
      done();
    });
  });

  it("dst!tpl/templateNmae!{object} should parse argument into object", function() {
    console.log("Run first test");
    var parsedName = dst_lib.parseTemplateName('dst!tpl/templateNmae!{"a":"b","c":{"d":"e"}}');
    parsedName.opts.should.have.properties({ a: "b", c: { d: "e" } });
  });

  it("both parsers should have same length for simple partials", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>';
    dst_lib.findPartialsRegex("", test_template).length.should.equal(dst_lib.findPartialsDust("", test_template).length);
  });

  it("both parsers should have same elements for simple partials", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>',
        regexParse = dst_lib.findPartialsRegex("", test_template),
        dustParse = dst_lib.findPartialsDust("", test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

  it("parse html with regex 100 times", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>';
    
    for ( var i = 0; i < 100; i++ )
      var regexParse = dst_lib.findPartialsRegex("", test_template);
  });

  it("parse html with dust 100 times", function() {
    var test_template = '<!DOCTYPE html><html><head><title>{title}</title><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0" /><link rel="stylesheet" href="/stylesheets/base.css">{+head/}</head><body class="jp-page">{>navbar/}<div class="jp-page-content">{+content/}</div><script src="/js/base.min.js"></script><script>requirejs.config({baseUrl: "/js"});</script>{+script/}</body></html>';
    
    for ( var i = 0; i < 100; i++ )
      var dustParse = dst_lib.findPartialsDust("", test_template);
  });

  it("regex should find 6 partials in multiple partial dust template", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    dst_lib.findPartialsRegex("", test_template).length.should.equal(6);
  });

  it("dust should find 6 partials in multiple partial dust template", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    dst_lib.findPartialsDust("", test_template).length.should.equal(6);
  });

  it("parse mostly dust with regex 100 times", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    for ( var i = 0; i < 100; i++ )
      var regexParse = dst_lib.findPartialsRegex("", test_template);
  });

  it("parse mostly dust with dust 100 times", function() {
    var test_template = '{>"footer"/}{+bye} bye {/bye}{>"head"/}{>"foot"/}{>"base"/}{<world} World {/world}{>"base"/}{<greeting}bye{/greeting}{>"base_end"/}{<bye}{! Do not print bye !}{/bye}';

    for ( var i = 0; i < 100; i++ )
      var dustParse = dst_lib.findPartialsDust("", test_template);
  });

  it("both parsers should have same length for partials with paths", function() {
    var test_template = '{>"path/to/partial"/}';
    dst_lib.findPartialsRegex("", test_template).length.should.equal(dst_lib.findPartialsDust("", test_template).length);
  });

  it("both parsers should have same elements for partials with paths", function() {
    var test_template = '{>"path/to/partial"/}',
        regexParse = dst_lib.findPartialsRegex("", test_template),
        dustParse = dst_lib.findPartialsDust("", test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

  it("regex should have same length of 1 for dynamic partial", function() {
    var test_template = '{>"dynaviews/dyna{a.viewname}"/}';
    dst_lib.findPartialsRegex("", test_template, { a: { viewname: "replacement" } }).length.should.equal(1);
  });

  it("regex should replace {a.viewname} with replacement", function() {
    var test_template = '{>"dynaviews/dyna{a.viewname}"/}',
        regexParse = dst_lib.findPartialsRegex("", test_template, { a: { viewname: "replacement" } });

    regexParse.should.matchEach(function(it) { return [ test_template.replace("{a.viewname}", "replacement") ]; });
  });

  it("both parsers should have same length for partials with parameters", function() {
    var test_template = '{>partial parameter=thingy/}';
    dst_lib.findPartialsRegex("", test_template).length.should.equal(dst_lib.findPartialsDust("", test_template).length);
  });

  it("both parsers should have same elements for partials with parameters", function() {
    var test_template = '{>partial parameter=thingy/}',
        regexParse = dst_lib.findPartialsRegex("", test_template),
        dustParse = dst_lib.findPartialsDust("", test_template);

    regexParse.should.matchEach(function(it) { return dustParse.indexOf(it) != -1 });
    dustParse.should.matchEach(function(it) { return regexParse.indexOf(it) != -1 });
  });

  it("should throw failed to parse error when given invalid json context", function() {
    var test_template_name = 'tpl/templateName!{invalidcontextshouldthrowerror}';
    ( function() { dst_lib.parseTemplateName(test_template_name) } ).should.throw(/Failed to parse context/);
  });

});