/* 
 * Copyright (C) 2016 Sean T. McBeth
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


// Pliny the (Elder|Younger) is a documentation construction system.
// You create live documentation objects on code assets with Pliny (the Elder),
// then you read back those documentation objects with Pliny (the Younger).
// 
// Pliny is also capable of generating HTML output for your documentation.
// 
// Pliny is named after Gaius Plinius Secundus (https://en.wikipedia.org/wiki/Pliny_the_Elder),
// a scholar and hero, who died trying to save people from the eruption of Mount
// Vesuvius during the destruction of Pompeii. Also, his nephew Gaius Plinius Caecilius Secundus
// (https://en.wikipedia.org/wiki/Pliny_the_Younger), through whom we know his uncle.

( function ( module ) {



  //////////////////////////////////////////////////////////////////////////////
  // Pliny's author is not smart enough to figure out how to make it possible //
  // to use it to document itself, so here's a bunch of comments.             //
  //////////////////////////////////////////////////////////////////////////////



  // The default storage location.
  var database = {
    fieldType: "database",
    fullName: "[Global]",
    id: "Global",
    description: "These are the elements in the global namespace."
  };

  // Walks through dot-accessors to retrieve an object out of a root object.
  // 
  // @param {Object} bag - the root object.
  // @param {String} name - a period-delimited list of object accessors, naming the object we want to access.
  // @returns {Object} - the object we asked for, or undefined, if it doesn't exist.
  function openBag ( bag, name ) {
    // Break up the object path
    var parts = name.split( "." );
    // Recurse through objects until we either run out of objects or find the
    // one we're looking for.
    for ( var i = 0; i < parts.length && !!bag; ++i ) {
      bag = bag[parts[i]];
    }
    return bag;
  }

  // Figures out if the maybeName parameter is a bag or a string path to a bag,
  // then either gives you back the bag, or finds the bag that the path refers to
  // and gives you that.
  // 
  // @param {Object} bag - the root object.
  // @param {String} maybeName - a period-delimited list of object accessors, naming the object we want to access.
  // @returns {Object} - the object we asked for, or undefined, if it doesn't exist.
  function resolveBag ( bag, maybeName ) {
    if ( typeof maybeName === "string" || maybeName instanceof String ) {
      return openBag( bag, maybeName );
    }
    else {
      return maybeName;
    }
  }

  /////
  // Fills in intermediate levels of an object tree to make the full object tree 
  // accessible, in the documentation database.
  // 
  // @param {String} name - a period-delimited list of object accessors, naming the object we want to fill in.
  // @returns {Object} - the leaf-level filled-in object.
  ///
  function fillBag ( name ) {
    // Start at the top level.
    var bag = database,
        // Break up the object path.
        parts = name.split( "." ),
        // We'll be rebuilding the path as we go, so we can name intermediate objects.
        path = "";
    // Walk through the object tree.
    for ( var i = 0; i < parts.length; ++i ) {
      // Fill in any missing objects.
      if ( !bag[parts[i]] ) {
        bag[parts[i]] = {};
      }

      // The first time we extend the path, it doesn't get a period seperator.
      if ( path.length > 0 ) {
        path += ".";
      }
      path += parts[i];

      // Drill down into the tree.
      bag = bag[parts[i]];

      // If we have a name, and the object hasn't already been named, then we
      // give it a name.
      if ( path.length > 0 && !bag.name ) {
        bag.name = path;
      }
    }
    return bag;
  }

  /////
  // Reads the documentation metadata and builds up the documentation database.
  // 
  // @param {String} fieldType - the name of the type of object for which we're reading metadata: function, class, namespace, etc.
  // @param {String} parentName - a period-delimited list of object accessors, naming the object that stores the object being analyzed.
  // @param {String} info - the metadata object the user provided us.
  ///
  function analyzeObject ( fieldType, parentName, info ) {
    // Sometimes, this function gets called through in a contextual state, in
    // which case, we don't care about the actual function call. We fill in
    // the context when we parse any function-type objects that get documented.
    if ( info ) {
      if ( typeof info === "string" || info instanceof String ) {
        var parts = parentName.split( "." );
        info = {name: parts.pop(), description: info};
        parentName = parts.join( "." );
      }
      // If the user didn't supply a type for the metadata object, we infer it
      // from context.
      if ( typeof info.fieldType === 'undefined' ) {
        info.fieldType = fieldType;
      }

      // Make an object path name for the object we're documenting.
      if ( !info.parent && parentName.length > 0 ) {
        info.parent = parentName;
      }

      // Find out where we're going to store the object in the metadata database.
      var parentBag = database;
      if ( parentName.length > 0 ) {
        parentBag = fillBag( parentName );
      }

      // Figure out where in the parent object we're going to store the documentation object.
      var pluralName = fieldType + "s";
      pluralName = pluralName.replace( /ys$/, "ies" ).replace( /ss$/, "ses" );
      if ( !parentBag[pluralName] ) {
        parentBag[pluralName] = [ ];
      }
      var arr = parentBag[pluralName];

      // Make sure we haven't already stored an object by this name.
      var found = false;
      for ( var i = 0; i < arr.length; ++i ) {
        if ( arr[i].name === info.name ) {
          found = true;
        }
      }

      if ( !found ) {
        var subArrays = {};
        for ( var k in info ) {
          if ( k === "examples" ) {
            subArrays[k] = info[k];
            delete info[k];
          }
        }
        // After we copy the metadata, we get back the documentation database object
        // that will store the fuller data we get from other objects.
        info = copyObjectMetadata( info );

        arr.push( info );

        // Make sure everything stays in a nice order.
        arr.sort( function ( a, b ) {
          var c = a.fullName,
              d = b.fullName;
          if ( c === "[Global]" ) {
            c = "A" + c;
          }
          if ( d === "[Global]" ) {
            d = "A" + d;
          }
          if ( c > d ) {
            return 1;
          }
          else if ( c < d ) {
            return -1;
          }
          else {
            return 0;
          }
        } );

        // Handle other parent-child relationships.
        if ( info.fieldType === "class" && info.baseClass ) {
          pliny.theElder.subClass( info.baseClass, info );
        }

        for ( var k in subArrays ) {
          var subArr = subArrays[k],
              type = k.substring( 0, k.length - 1 );
          for ( var i = 0; i < subArr.length; ++i ) {
            pliny.theElder[type]( info.fullName, subArr[i] );
          }
        }
      }
    }
  }

  /////
  // Copies all of the data the user entered for metadata to the documetation
  // object in the documentation database.
  // 
  // @param {String} name - a period-delimited list of object accessors, naming the documentation object we want to create.
  // @param {Object} info - the metadata object from the user.
  // @returns the documentation object that we created.
  ///
  function copyObjectMetadata ( info ) {
    var fullName = ( info.parent && ( info.parent + "." ) || "" ) + info.name,
        bag = fillBag( fullName );

    // Make sure we aren't setting the data for a second time.
    if ( !bag.fieldType ) {

      // Copy all the fields! ALL THE FIELDS!
      for ( var k in info ) {
        bag[k] = info[k];
      }

      // The fullName is used in titles on documentation articles.
      if ( !bag.fullName ) {
        Object.defineProperty( bag, "fullName", {
          get: function () {
            var output = "";
            if ( this.parent ) {
              output += this.parent;

              // Print the seperator between the parent identifier and the name of
              // the object.
              if ( this.fieldType === "method" || this.fieldType === "property" || this.fieldType === "event" ) {
                // Methods, properties, and events aren't invokable from their class
                // objects, so print them in a different way that doesn't suggest you
                // can dot-access them. I'm using the typical C++ notation for member
                // fields here.
                output += "::";
              }
              else if ( this.fieldType === "example" ) {
                output += ": ";
              }
              else {
                output += ".";
              }
            }
            output += this.name;
            return output;
          }
        } );
      }

      // The ID is used to make DOM elements.
      if ( !bag.id ) {
        Object.defineProperty( bag, "id", {
          get: function () {
            return this.fullName.replace( /(\.|:)/g, "_" ).replace( / /g, "" );
          }
        } );
      }

      // We try to see if the real object exists yet (whether the documentation
      // before or after the object it is documenting). If it doesn't, then we
      // wait a small amount of time for the rest of the script to execute and
      // then pick up where we left off.
      if ( !setContextualHelp( fullName ) ) {
        // The setTimeout is to allow the script to continue to load after this
        // particular function has called, so that more of the script can be
        // inspected.
        setTimeout( setContextualHelp, 1, fullName );
      }
    }
    return bag;
  }

  var scriptPattern = /\bpliny\s*\.\s*theElder\s*\.\s*(\w+)/gm;
  /////
  // Finds the actual object in the scope hierarchy, and:
  //  A) looks for contextual scripts that might be defined in this object
  //  B) creates a live-accessible help function on the object, that we can call from the browser console/Node REPL
  // 
  // @param {String} name - a period-delimited list of object accessors, naming the real object we want to access. 
  // @returns {Object} - the actual object the name refers to, or undefined if such an object exists.
  ///
  function setContextualHelp ( name ) {
    // Find the real object
    var obj = openBag( window, name );
    if ( obj ) {
      // Look for contextual scripts
      if ( typeof obj === "function" ) {
        var script = obj.toString( ),
            match = null;
        while ( !!( match = scriptPattern.exec( script ) ) ) {
          var fieldType = match[1],
              start = match.index + match[0].length,
              parameters = parseParameters( script.substring( start ) );
          // Shove in the context.
          if ( parameters.length === 1 ) {
            parameters.unshift( name );
          }
          else {
            parameters[0] = name + "." + parameters[0];
          }

          // And follow the normal documentation path.
          pliny.theElder[fieldType].apply( null, parameters );
        }
      }

      // Create the live-accessible documentation function
      obj.help = pliny.theYounger.bind( null, name );
    }
    return obj;
  }

  /////
  // When a documentation script is included inside of a function, we need to
  // read the script and parse out the JSON objects so we can later execute
  // the documentation function safely, i.e. not use eval().
  // 
  // @param {String} script - the source code of the containing function.
  // @param {String} start - the index at which the parameter list for the documentation function starts.
  // @return {Array} - a list of JSON-parsed objects that are the parameters specified at the documentation function call-site (i.e. sans context)
  ///
  function parseParameters ( script ) {
    var parameters = [ ];

    // Walk over the script...
    for ( var i = 0, start = 0, scopeLevel = 0, inString = false; i < script.length; ++i ) {
      // ... a character at a time
      var c = script.charAt( i );

      // Keep track of whether or not we're in a string. We're looking for any
      // quotation marks that are either at the beginning of the string or have
      // not previously been escaped by a backslash...
      if ( c === '"' && ( i === 0 || script.charAt( i - 1 ) !== '\\' ) ) {
        inString = !inString;
      }

      // ... because only then...
      if ( !inString ) {
        // ... can we change scope level. We're only supporting JSON objects,
        // so no need to go any further than this.
        if ( c === '(' || c === '{' || c === '[' ) {
          ++scopeLevel;
        }
        else if ( c === ')' || c === '}' || c === ']' ) {
          --scopeLevel;
        }
      }

      // If we're exited the parameter list, or we're inside the parameter list 
      // and see a comma that is not inside of a string literal...
      if ( scopeLevel === 0 || scopeLevel === 1 && c === ',' && !inString ) {
        // ... save the parameter, skipping the first character because it's always
        // either the open paren for the parameter list or one of the commas
        // between parameters.
        parameters.push( parseParameter( script.substring( start + 1, i ).trim( ) ) );

        // Advance forward the start of the next token.
        start = i;

        // If we left the parameter list, we've found all of the parameters and
        // can quit out of the loop before we get to the end of the script.
        if ( scopeLevel === 0 ) {
          break;
        }
      }
    }
    return parameters;
  }

  ////
  // useful in cases where a functional system really just needs to check the
  // value of a collection.
  ///
  function identity ( v ) {
    return v;
  }

  /////
  // When we've found an individual parameter to a documentation function in a 
  // contextual scope, we need to make sure it's valid JSON before we try to
  // convert it to a real JavaScript object.
  // 
  // @param {String} script - the subscript portion that refers to a single parameter.
  // @return {Object} - the value that the string represents, parsed with JSON.parse().
  ///
  function parseParameter ( script ) {
    // Make sure all hash key labels are surrounded in quotation marks.
    var stringLiterals = [ ];
    var param = script.replace( /"(\\"|[^"])+"/g, function ( str ) {
      var name = "&STRING_LIT" + stringLiterals.length + ";";
      stringLiterals.push( str );
      return name;
    } )
        .replace( /\b(\w+)\b\s*:/g, "\"$1\":" )
        .replace( /&STRING_LIT(\d+);/g, function ( a, b ) {
          return stringLiterals[b];
        } );

    try {
      return JSON.parse( param );
    }
    catch ( e ) {
      // If we made a bad assumption, this will tell us what the assumption was,
      // while also forwarding on the specific error.
      console.error( script, "=>", param );
      throw e;
    }
  }

  // A collection of different ways to output documentation data.
  var formatters = {
    /////
    // Find a particular object and print out the documentation for it.
    // 
    // @param {String} name - a period-delimited list of object accessors, naming the object we want to access. 
    ///
    format: function ( name ) {
      var obj = null;
      if ( typeof name === "string" || name instanceof String ) {
        obj = openBag( database, name );
      }
      else {
        obj = name;
      }
      if ( obj ) {
        var output = this.shortDescription( true, obj );

        // The array defines the order in which they will appear.
        output += "\n\n" + [
          "parent",
          "description",
          "parameters",
          "returns",
          "errors",
          "namespaces",
          "classes",
          "functions",
          "values",
          "events",
          "properties",
          "methods",
          "enumerations",
          "records",
          "references",
          "examples" ].map( formatters.checkAndFormatField.bind( this, obj ) )
            // filter out any lines that returned undefined because they didn't exist
            .filter( identity )
            // concate them all together
            .join( "\n" );
        return output;
      }
    },
    checkAndFormatField: function ( obj, p, i ) {
      var o = obj[p];
      if ( o ) {
        return this.formatField( obj, p, o, i );
      }
    }
  };
  // Make HTML that can be written out to a page
  formatters.html = {
    format: function ( name ) {
      var obj = resolveBag( database, name );
      return "<section id=\"" + obj.id + "\" class=\"" + obj.fieldType + "\"><article>" + formatters.format.call( formatters.html, obj ) + "</article></section>";
    },
    /////
    // Puts together a string that describes a top-level field out of a documentation
    // object.
    // 
    // @param {Object} obj - the documentation object out of which we're retrieving the field.
    // @param {String} p - the name of the field we're retrieving out of the documentation object.
    // @return {String} - a description of the field.
    ///
    formatField: function ( obj, p, o ) {
      var output = "";
      if ( o instanceof Array ) {
        output += this.formatArray( obj, p, o );
      }
      else if ( p === "parent" ) {
        output += "<p>Contained in <a href=\"#" + pliny.get( o ).id + "\">" + o + "</a></p>";
      }
      else if ( p === "description" ) {
        output += this.endocumate( o );
      }
      else {
        output += "<dl><dt>" + p + "</dt><dd>" + o + "</dd></dl>";
      }
      return output;
    },
    // This is a slightly rough version of Markdown that does not include the 
    // full link/image sytnax, emphasis, underline, or bold, and uses its own 
    // syntax for code blocks (double backticks instead of indenting).
    endocumate: function ( str, depth ) {
      if ( depth === undefined ) {
        depth = 0;
      }
      if ( depth < 5 ) {
        var pres = [ ];
        return "<p>" + str
            .replace( /(``?)([^`]+)\1/g, function ( str, group1, group2 ) {
              var name = "&PRE_SNIP" + pres.length + ";",
                  tag = group1 === "``" ? "pre" : "code",
                  content = group2.replace( /&/g, "&amp;" ).replace( /</g, "&lt;" ).replace( />/g, "&gt;" );
              pres.push( "<" + tag + ">" + content + "</" + tag + ">" );
              return name;
            } )
            .replace( /&(?!\w+;)/g, "&amp;" )
            .replace( /((\*|-)\s*){3,}\n/g, "<hr>" )
            .replace( /^([^\n]+)\n=+\n/mg, "<h1>$1</h1>" )
            .replace( /^([^\n]+)\n-+\n/mg, "<h2>$1</h2>" )
            .replace( /(#{1,6})\s*([^#\n]+)\s*#*\n/g, function ( str, group1, group2 ) {
              var h = group1.length;
              return "<h" + h + ">" + group2 + "</h" + h + ">";
            } )
            .replace( /(^(\*|-|\+|\d+\.)\s+[^\n]+\n)+/mg, function ( str ) {
              var tag = /\d/.test( str[0] ) ? "ol" : "ul";
              return "<" + tag + ">" + str.replace( /(\*|-|\+|\d+\.)\s+([^\n]+)\n/g, "<li>$2</li>" ) + "</" + tag + ">";
            } )
            .replace( /(^> [^\n]+\n)+/mg, function ( str ) {
              return "<blockquote>" + this.endocumate( str.replace( /^> /mg, "" ), depth + 1 ) + "</blockquote>";
            }.bind(this) )
            .replace( /!\[([^\]]+)\]\s*\(([^\)]+)\)/g, "<img title=\"$1\" alt=\"diagram\" src=\"$2\">" )
            .replace( /\[([^\]]+)\]\s*\(([^\)]+)\)/g, "<a href=\"$2\">$1</a>" )
            .replace( /<(?!\/|(a|abbr|address|area|article|aside|audio|b|base|bdi|bdo|bgsound|blockquote|body|br|button|canvas|caption|cite|code|col|colgroup|command|content|data|datalist|dd|del|details|dfn|dialog|div|dl|dt|element|em|embed|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|head|header|hgroup|hr|html|i|iframe|img|input|ins|kbd|label|legend|li|link|main|map|mark|menu|menuitem|meta|meter|nav|nobr|noframes|noscript|object|ol|optgroup|option|output|p|param|picture|pre|progress|q|rp|rt|rtc|ruby|s|samp|script|section|select|shadow|small|source|span|strong|style|sub|summary|sup|table|tbody|td|template|textarea|tfoot|th|thead|time|title|tr|track|u|ul|var|video|wbr)\b)/g, "&lt;" )
            .replace( /\n\s*\n/g, "</p><p>" )
            .replace( /  \n/g, "<br>" )
            .replace( /&PRE_SNIP(\d+);/g, function ( str, match ) {
              return pres[match];
            } ) + "</p>";
      }
    },
    ////
    // Specific formatting function for Description fields when they are defined
    // as arrays.
    //
    // @param {Array} arr - an array of strings that define a long description.
    // @return {String} - a summary/details view of the description.
    descriptionFormat: function ( obj, arr ) {
      var temp = arr.slice();
      return "<p>" + temp.join( "</p><p>" ) + "</p>";
    },
    ////
    // Specific formatting function for Code Example.
    //
    // @param {Array} arr - an array of objects defining programming examples.
    // @return {String} - a summary/details view of the programming examples.
    examplesFormat: function ( obj, arr ) {
      var output = "";
      for ( var i = 0; i < arr.length; ++i ) {
        var ex = arr[i];
        output += "<div><h4><a href=\"#" + ex.id + "\">" + ex.name + "</a></h4>" + this.endocumate( ex.description ) + "</div>";
      }
      return output;
    },
    ////
    // Specific formatting function for References section.
    //
    // @param {Array} arr - an array of objects defining reference links, with name as link text and description as link URL.
    // @return {String} - links as a list.
    referencesFormat: function ( obj, arr ) {
      var output = "<ol>";
      for ( var i = 0; i < arr.length; ++i ) {
        output += "<li><a href=\"" + arr[i].description + "\" target=\"_blank\">" + arr[i].name + "</a></li>";
      }
      return output + "</ol>";
    },
    /////
    // Puts together lists of parameters for function signatures, as well as
    // lists of properties and methods for classes and the like.
    // 
    // @param {Object} obj - the documentation object from which to read an array.
    // @param {String} arrName - the name of the array to read from the documentation object.
    // @return {String} - the formatted description of the array.
    ///
    formatArray: function ( obj, arrName, arr ) {
      var output = "<h3>";
      if ( obj.fieldType === "class" ) {
        if ( arrName === "parameters" ) {
          output += "constructor ";
        }
        else if ( arrName === "functions" ) {
          output += "static ";
        }
      }

      if ( arrName !== "description" ) {
        output += arrName;
      }

      output += "</h3>";

      var formatterName = arrName + "Format";
      if ( this[formatterName] ) {
        output += this[formatterName]( obj, arr );
      }
      else {
        output += "<ul class=\"" + arrName + "\">" + arr.map( this.formatArrayElement.bind( this, arrName ) ).join( "" ) + "</ul>";
      }
      return output;
    },
    /////
    // For individual elements of an array, formats the element so it fits well
    // on the screen. Elements that are supposed to be inline, but have the ability
    // to be drilled-down into, are truncated if they get to be more than 200
    // characters wide.
    // 
    // @param {String} arrName - the name of the array from which we retrieved elements.
    // @param {String} n - one of the array elements.
    // @return {String} - the formatted element, including a newline at the end.
    ///
    formatArrayElement: function ( arrName, n ) {
      var s = "<li>";
      if ( n.description ) {
        s += "<dl><dt>" + this.shortDescription( false, n ) + "</dt><dd>";
        if ( n.description instanceof Array ) {
          s += n.description[0];
        }
        else {
          s += n.description;
        }
        s += "</dd></dl>";
      }
      else {
        s += this.shortDescription( false, n );
      }
      s += "</li>";
      return s;
    },
    /////
    // Describe an object by type, name, and parameters (if it's a function-type object).
    // @param {Object} p - the documentation object to describe.
    // @return {String} - the description of the documentation object.
    ///
    shortDescription: function ( topLevel, p ) {
      var output = "",
          tag = topLevel ? "h2" : "span",
          isFunction = p.fieldType === "function" || p.fieldType === "method" || p.fieldType === "event",
          isContainer = isFunction || p.fieldType === "class" || p.fieldType === "namespace" || p.fieldType === "enumeration" || p.fieldType === "subClass" || p.fieldType === "record";

      output += "<" + tag + ">";
      if ( isContainer && !topLevel ) {
        output += "<a href=\"#" + p.id + "\">";
      }
      output += "<code>" + ( topLevel && p.fieldType !== "example" ? p.fullName : p.name );

      if ( p.type ) {
        output += " <span class=\"type\">" + p.type + "</span>";
      }


      // But functions and classes take parameters, so they get slightly more.
      if ( isFunction ) {
        output += "<ol class=\"signatureParameters\">";
        if ( p.parameters ) {
          output += "<li>" + p.parameters.map( function ( p ) {
            return p.name;
          } ).join( "</li><li>" ) + "</li>";
        }
        output += "</ol>";
      }

      if ( isContainer && !topLevel ) {
        output += "</a>";
      }
      return output + "</code></" + tag + ">";
    }
  };

  // Output to the Developer console in the browser directly.
  formatters.console = {
    format: function ( name ) {
      var output = formatters.format.call( formatters.console, name );
      console.log( output );
      return output;
    },
    /////
    // Puts together a string that describes a top-level field out of a documentation
    // object.
    // 
    // @params {Object} obj - the documentation object out of which we're retrieving the field.
    // @params {String} p - the name of the field we're retrieving out of the documentation object.
    // @return {String} - a description of the field.
    ///
    formatField: function ( obj, p, o ) {
      if ( o instanceof Array ) {
        return this.formatArray( obj, p, o );
      }
      else if ( p === "description" ) {
        return "\t" + o + "\n";
      }
      else {
        return "\t" + p + ": " + o + "\n";
      }
    },
    /////
    // Puts together lists of parameters for function signatures, as well as
    // lists of properties and methods for classes and the like.
    // 
    // @param {Object} obj - the documentation object from which to read an array.
    // @param {String} arrName - the name of the array to read from the documentation object.
    // @return {String} - the formatted description of the array.
    ///
    formatArray: function ( obj, arrName, arr ) {
      var output = "\t";
      if ( obj.fieldType === "class" ) {
        if ( arrName === "parameters" ) {
          output += "constructor ";
        }
        else if ( arrName === "functions" ) {
          output += "static ";
        }
      }

      if ( arrName !== "description" ) {
        output += arrName + ":\n";
      }

      if ( arrName === "description" && arr instanceof Array ) {
        arr = arr.join( "\n\n\t" ) + "\n";
      }
      if ( arr instanceof Array ) {
        output += arr.map( this.formatArrayElement.bind( this, arrName ) ).join( "" );
      }
      else {
        output += arr;
      }
      return output;
    },
    /////
    // For individual elements of an array, formats the element so it fits well
    // on the screen. Elements that are supposed to be inline, but have the ability
    // to be drilled-down into, are truncated if they get to be more than 200
    // characters wide.
    // 
    // @param {String} arrName - the name of the array from which we retrieved elements.
    // @param {String} n - one of the array elements.
    // @param {Number} i - the index of the element in the array.
    // @return {String} - the formatted element, including a newline at the end.
    ///
    formatArrayElement: function ( arrName, n, i ) {
      var s = "\t\t" + i + ": " + this.shortDescription( false, n );
      if ( n.description ) {
        s += " - ";
        if ( n.description instanceof Array ) {
          s += n.description[0];
        }
        else {
          s += n.description;
        }

        if ( arrName !== "parameters" && arrName !== "properties" && arrName !== "methods" && s.length > 200 ) {
          s = s.substring( 0, 200 ) + "...";
        }
      }
      s += "\n";
      return s;
    },
    /////
    // Describe an object by type, name, and parameters (if it's a function-type object).
    // @param {Object} p - the documentation object to describe.
    // @return {String} - the description of the documentation object.
    ///
    shortDescription: function ( topLevel, p ) {
      // This is the basic description that all objects get.
      var output = "";
      if ( topLevel || p.type ) {
        output += "[" + ( p.type || p.fieldType ) + "] ";
      }

      output += topLevel ? p.fullName : p.name;

      // But functions and classes take parameters, so they get slightly more.
      if ( p.fieldType === "function" || p.fieldType === "method" ) {
        output += "(";
        if ( p.parameters ) {
          output += p.parameters.map( this.shortDescription.bind( this, false ) ).join( ", " );
        }
        output += ")";
      }

      return output;
    }
  };




  // The namespacing object we're going to return to the importing script.
  var pliny = {
    // The bag of documentation functions.
    theElder: {},
    // The default formatter goes straight to the console.
    theYounger: formatters.console.format,
    // Give the user access to the database.
    database: database,
    // Give the user access to all of the formatters.
    formats: formatters
  };

  // Just get the raw data
  pliny.get = openBag.bind( null, pliny.database );

  // Create documentation functions for each of the supported types of code objects.
  [ "namespace",
    "event",
    "function",
    "value",
    "class",
    "property",
    "method",
    "enumeration",
    "record",
    "subClass",
    "example",
    "reference",
    "error" ].forEach( function ( k ) {
    pliny.theElder[k] = analyzeObject.bind( null, k );
  } );

  module.exports = pliny;

} )( typeof module !== 'undefined' && module || ( function ( name ) {
  var module = {};
  Object.defineProperty( module, "exports", {
    get: function () {
      return window[name];
    },
    set: function ( v ) {
      window[name] = v;
    }
  } );
  return module;
} )( "pliny" ) );