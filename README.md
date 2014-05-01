requirejs-dust
==============

## requirejs-dust

A [RequireJS](http://requirejs.org/ "RequireJS") plugin for compiling [LinkedIn Dust](https://github.com/linkedin/dustjs "LinkedIn Dust on GitHub") dependencies into modules. Partials found within a template are added as dependencies. Based upon the plugin [require-cs](https://github.com/requirejs/require-cs).

This plugin requires templates to be precompiled, and will compile them using the RequireJS optimization process.

## Usage

### Basic

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

### Extra

Requirejs-dust compiles your templates during the opitimization process of RequireJS and therefore your context is not necessarily defined at that time. Because of this dynamic partials are ignored by default and it is left to you to include them.

If your application though does know the values to use for dynamic partials and compile time you can use the optional argument to pass in a JSON object and it will be used as a context to try and find values to use for your dynamic partials. Any found values will be used and the dynamic partials whose value can not be found are left alone.

Template:

	{>"dynaviews/dyna{a.viewname}"/}

Logic:

	require( ["dst!tpl/Page!{{a:{viewname:\"replacement\"}}}"], function() {
		// Do things
	});

## Optimization

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

## Tips

The idea behind the plugin is to build with node and then ship the compiled templates with dust core rather than full

The following can be added to your require config ( I didn't write this, but I can't find my source to give them credit )

	onBuildWrite : function(moduleName, path, content){
		if (moduleName === 'dust') {
		    path = path.replace('dust.full.js','dust.js');
		    content = fs.readFileSync(path).toString();
		    content = content.replace(/(define\()(function)/, '$1"dust", $2');
		}
	    return content;
  	}

## TODO

* Build lots more tests