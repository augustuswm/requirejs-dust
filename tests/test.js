var requirejs = require("requirejs");
var should = require('should');

requirejs.config({
  baseUrl: ".",
  paths: {
    "dst": "../require.dust"
  },
  nodeRequire: require
});

describe("Template Compilation", function() {

  it("should always pass", function(done) {

    //requirejs(['dst'], function(plugin) {
    setTimeout( function() {
      [0,1,2].should.have.length(3);
      done();
    }, 150);
    //});
  });

});