/** @license
 * RequireJS plugin for loading dust templates based on require-cs
 * Author: Augustus Mayo
 * Version: 0.0.1
 * Released under the MIT license
 * 
 * example: dst!templatename
 * Todo: remove require that plugin be named dst ( allows for partials as deps )
 */
define(["module", "dust"], function (module, dust) {
  "use strict";

  var buildMap = {},
      buildString = "define([{deps}], function(dust) { return {template} });",
      partialRegex = /\{>(([^\s"}]+)|"([^\s}]+}?)")( [^\/]+)?\/\}/g,
      dynamicPartialRegex = /\{([^\s}]+)\}/,
      configPluginName = module.config().name || "dst",
      fs, getXhr,
      progIds = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"],
      fetchText = function () {
        throw new Error("Environment unsupported.");
      };

  var substituteDynamic = function( dynamicMatch, context ) {
    if ( dynamicMatch.lastIndexOf(".") > -1 ) {
      var pathPieces = dynamicMatch.split("."), pathPlace = context;

      // Traverse the context until value is found or a property is not defined
      for ( var i = 0; i < pathPieces.length && pathPlace.hasOwnProperty(pathPieces[i]); i++ ) {
        pathPlace = pathPlace[pathPieces[i]];
      }

      // Only return our found value if it is suitable as a replacement
      if ( typeof( pathPlace ) === "string" )
        return pathPlace;
      else
        return null;
    }
  };

  var findPartialsRegex = function( templateName, template, context ) {
    var partials = [], match, parsedName = parseTemplateName( templateName ), matchName;
          
    // Find all partial matches
    while ( ( match = partialRegex.exec(template) ) ) {
      // Match[2] => simple partial ( no quotes, no arguments, and is not dynamic )
      // Match[3] => complex partial ( quoted name, arguments, or is dynamic )
      // Can this be simplified into a single match?
      if ( match[2] === undefined )
        matchName = match[3];
      else
        matchName = match[2];

      // If we were given a context to use to replace check to see if the
      // partial we found is a dynamic partial if so attempt replacement
      // What if there are multiple dynamic pieces to replace?
      if ( context !== null && ( match = dynamicPartialRegex.exec(matchName) ) ) {
        match = match[1];

        var matchReplacement = substituteDynamic( match, context );

        if ( matchReplacement !== null )
          matchName = matchName.replace("{" + match + "}", matchReplacement);
      
      }


      partials.push( "'" + configPluginName + "!" + parsedName.dir + matchName + "'" );
    }

    return partials;
  };

  var findPartialsDust = function( templateName, template ) {
    var components = dust.parse( template ), partials = [], parsedName = parseTemplateName( templateName );

    for ( var i = components.length - 1; i >= 0; i-- )
      if ( components[i][0] == "partial" )
        partials.push( "'" + configPluginName + "!" + parsedName.dir + components[i][1][1] + "'" );

    return partials;
  };

  var findPartials = findPartialsRegex;

  var parseTemplateName = function( name ) {
    var parsed = { dir: "", name: "", ext: "", opts: null }, separationCol = name.lastIndexOf("!");

    if ( separationCol > -1 ) {
      try {
        parsed.opts = JSON.parse(name.substr(separationCol + 1));
      } catch ( err) {
        throw new SyntaxError("Failed to parse context");
      }
    }

    parsed.dir = name.substr(0, name.lastIndexOf("/") + 1);
    parsed.name = name.substr(name.lastIndexOf("/") + 1);
    parsed.ext = name.substr(name.lastIndexOf("."));

    return parsed;
  };

  if (typeof process !== "undefined" &&
      process.versions &&
      !!process.versions.node) {
      //Using special require.nodeRequire, something added by r.js.
    fs = require.nodeRequire("fs");
    fetchText = function (path, callback) {
      callback(fs.readFileSync(path, "utf8"));
    };
  } else if ((typeof window !== "undefined" && window.navigator && window.document) || typeof importScripts !== "undefined") {
    // Browser action
    getXhr = function () {
      //Would love to dump the ActiveX crap in here. Need IE 6 to die first.
      var xhr, i, progId;
      
      if (typeof XMLHttpRequest !== "undefined") {
        return new XMLHttpRequest();
      } else {
        for (i = 0; i < 3; i += 1) {
          progId = progIds[i];
          try {
            xhr = new ActiveXObject(progId);
          } catch (e) {}

          if (xhr) {
            progIds = [progId];  // so faster next time
            break;
          }
        }
      }

      if (!xhr) {
        throw new Error("getXhr(): XMLHttpRequest not available");
      }
    
      return xhr;
    };

    fetchText = function (url, callback) {
      var xhr = getXhr();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = function ( /*evt*/ ) {
        //Do not explicitly handle errors, those should be
        //visible via console output in the browser.
        if (xhr.readyState === 4) {
          callback(xhr.responseText);
        }
      };
      
      xhr.send(null);
    };
    // end browser.js adapters
  
  } else if (typeof Packages !== "undefined") {
    /* jshint ignore:start */

    //Why Java, why is this so awkward?
    fetchText = function (path, callback) {
      var stringBuffer, line,
          encoding = "utf-8",
          file = new java.io.File(path),
          lineSeparator = java.lang.System.getProperty("line.separator"),
          input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)),
          content = "";
      
      try {
        stringBuffer = new java.lang.StringBuffer();
        line = input.readLine();

        // Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
        // http://www.unicode.org/faq/utf_bom.html

        // Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
        // http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
        if (line && line.length() && line.charAt(0) === 0xfeff) {
          // Eat the BOM, since we've already found the encoding on this file,
          // and we plan to concatenating this buffer with others; the BOM should
          // only appear at the top of a file.
          line = line.substring(1);
        }

        stringBuffer.append(line);

        while ((line = input.readLine()) !== null) {
          stringBuffer.append(lineSeparator);
          stringBuffer.append(line);
        }
        //Make sure we return a JavaScript string and not a Java string.
        content = String(stringBuffer.toString()); //String
      } finally {
        input.close();
      }
      callback(content);
    };

    /* jshint ignore:end */
  }

  // API
  return {

    version: "0.0.1",

    load : function (name, req, onLoad, config) {
      var parsed = parseTemplateName( name );
      var path = req.toUrl( name + ( config.isBuild ? ".dust" : ".js" ) );



      fetchText(path, function (text) {

        //Hold on to the compiled template as text if a build.
        if (config.isBuild) {
          if ( !(dust) || !(dust.compile) )
            throw new ReferenceError( "dust.compile is not available to compile template" );

          var partials = findPartials( text, parsed.opts );
          
          partials.unshift("'dust'");

          text = dust.compile(text, parsed.name);
          text = buildString.replace("{deps}", partials.join(",")).replace("{template}",text);
          buildMap[name] = text;
        }

        onLoad.fromText(text);

        //Give result to load. Need to wait until the module
        //is fully parse, which will happen after this
        //execution.
        req([name], function (value) {
          onLoad(value);
        });

      });
    },

    write: function (pluginName, name, write) {
      if (buildMap.hasOwnProperty(name)) {
        var text = buildMap[name];
        write.asModule(pluginName + "!" + name, text);
      }
    },

    parseTemplateName: parseTemplateName,

    findPartialsRegex: findPartialsRegex,

    findPartialsDust: findPartialsDust

  };

});