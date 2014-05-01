describe("Template building", function() {

  var dst_lib, requirejs = require("requirejs"), should = require("should");

  before(function() {
    requirejs.config({
      baseUrl: ".",
      paths: {
        "dst": "../require.dust",
        "dust": "dust.core"
      },
      shim: {
        "dust": {
          exports: "dust"
        }
      }
    });
  });

  it("should throw a reference error if dust compiler is not available", function(done) {

    requirejs(['dst'], function(plugin) {
      dst_lib = plugin;
      ( function() { dst_lib.load("test_templates/empty", requirejs, function() {}, { isBuild: true }); }).should.throw(/dust.compile is not available to compile template/);
      done();
    });

  });

});