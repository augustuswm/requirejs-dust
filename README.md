requirejs-dust
==============

## requirejs-dust <a name="requirejs-dust".</a>

A [RequireJS](http://requirejs.org/ "RequireJS") plugin for compiling [LinkedIn Dust](https://github.com/linkedin/dustjs "LinkedIn Dust on GitHub") dependencies into modules. Partials found within a template are added as dependencies. Based upon the plugin [require-cs](https://github.com/requirejs/require-cs).

This plugin requires templates to be precompiled, and will compile them using the RequireJS optimization process.

## Usage <a name="usage".</a>

Reference dust files via the dst! plugin name.

Add the plugin to your path:

	({
		path: {
			"dst": path/to/require.dust
		}
	})

Example:

	require(["dst!tpl/Page"], function() {
		// Do things
	});

During the optimization process the plugin will parse for partials that are required by dependent templates.

Example: tpl/Page.dust

	<div class="panel-heading">
		{>Header/}
	</div>
	<div class="body">
		Some content stuff
	</div>

Compiles to:
	
	define('dst!tpl/Page', ['dust','dst!tpl/Header'], function() {
		return (function() {
			dust.register("Page",body_0);
			
			function body_0(chk,ctx) {
				return chk.write("<div class=\"panel-heading\">").partial("Header",ctx,null).write("</div><div class=\"body\">Some content stuff</div>");
			}
			
			return body_0;
		})();
	});

## TODO <a name="todo".</a>

* Test versus dust lib for finding partials
* Can plugin name be abstracted out?
* Test and implement behavior for relative paths.