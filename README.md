requirejs-dust
==============

## requirejs-Dust <a name="requirejs-dust".</a>

A [RequireJS](http://requirejs.org/ "RequireJS") plugin for compiling [LinkedIn Dust](https://github.com/linkedin/dustjs "LinkedIn Dust on GitHub") dependencies. Partials found within a template are added as dependencies. Based upon the plugin [require-cs](https://github.com/requirejs/require-cs).

## Usage <a name="usage".</a>

Reference dust files via the dst! plugin name.

Example:

	require(["dst!tpl/Bundle"], function() {
		// Do things
	});