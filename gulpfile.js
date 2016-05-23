﻿function recurseDirectory(root) {
  var directoryQueue = [root],
    files = [];
  while (directoryQueue.length > 0) {
    var directory = directoryQueue.shift(),
      subFiles = fs.readdirSync(directory);
    for (var j = 0; j < subFiles.length; ++j) {
      var subFile = path.join(directory, subFiles[j]),
        stats = fs.lstatSync(subFile);
      if (stats.isDirectory()) {
        directoryQueue.push(subFile);
      }
      else {
        files.push(subFile.replace(/\\/g, "/"));
      }
    }
  }
  return files;
}

var gulp = require("gulp"),
  babel = require("gulp-babel"),
  concat = require("gulp-concat"),
  data = require("gulp-data"),
  footer = require("gulp-footer"),
  fs = require("fs"),
  jshint = require("gulp-jshint"),
  path = require("path"),
  pkg = require("./package.json"),
  pliny = require("pliny"),
  pug = require("gulp-pug"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify"),
  sourceFiles = recurseDirectory("src"),
  headerFiles = [
    "node_modules/logger/logger.js",
    "node_modules/promise-polyfill/promise.js",
    "node_modules/lavu-details-polyfill/lib/index.min.js",
    "node_modules/pliny/pliny.js",
    "node_modules/socket.io-client/socket.io.js",
    "node_modules/three/three.js",
    "node_modules/three/examples/js/loaders/OBJLoader.js",
    "node_modules/three/examples/js/loaders/MTLLoader.js",
    "node_modules/html2canvas/dist/html2canvas.js"
  ],
  docFiles = recurseDirectory("templates/doc")
    .filter(function (f) {
      return /.jade$/.test(f);
    })
    .map(function (f, i) {
      var file = fs.readFileSync(f, "utf-8").toString(),
        // This regex looks for an H1 tag in the document. The H1 tag will be parsed
        // to use as the link text in the menu.
        headerSpec = /(?:\b(\d+)\r\n\s*)?h1 (?:(?:(\w+): )?([^\r\n]+))/,
        match = file.match(headerSpec);
      // Only pages that have an H1 tag are going to be included in the menu.
      if (match) {
        var fileName = f.replace(/\\/g, "/").replace(/^templates\/(.+)\.jade$/, "$1"),
          index = i,
          type = (match[2] || "Page") + "s";

        // there is an optional item index value that can be inserted before the page
        // title H1, to define how the pages are sorted.
        if (match[1]) {
          index = parseFloat(match[1]);
        }

        if (type === "Examples") {
          fileName = fileName.replace("/index", "");
        }

        var obj = {
          fileName: fileName,
          index: index,
          type: type,
          title: match[3],
          incomplete: /\[under construction\]/.test(file)
        };

        return obj;
      }
    })
    // discard any matches that didn't have an H1 header.
    .filter(function (f) {
      return f;
    }),
  debugDataES6 = {
    debug: true,
    jsExt: ".js",
    cssExt: ".css",
    frameworkFiles: headerFiles.concat(sourceFiles)
  },
  debugDataES5 = JSON.parse(JSON.stringify(debugDataES6));

docFiles.sort(function (a, b) {
  return a.index - b.index;
});

debugDataES5.frameworkFiles = debugDataES5.frameworkFiles.map(function (f) {
  return f.replace(/^src\//, "es5/");
});

function pugConfiguration(options, defaultData) {
  function getFile(fileName) {
    return fs.readFileSync(fileName, "utf-8");
  }
  function getDemoScript(scriptName) {
    return "grammar(\"JavaScript\");\n" + getFile(scriptName);
  }
  function getFileDescrip(f) {
    return [f, fs.lstatSync(f).size];
  }
  var frameworkFiles = defaultData.frameworkFiles.map(getFileDescrip);
  return gulp.src(["*.jade", "*.pug", "templates/doc/**/*.jade", "templates/doc/**/*.pug"], { base: "./" })
    .pipe(rename(function (p) {
      p.extname = "";
      p.dirname = p.dirname.replace("templates" + path.sep, "");
      return p;
    }))
    .pipe(data(function (file, callback) {
      var name = file.path.replace(/\\/g, "/"),
        parts = name.split("/")
          .map(function () {
            return "../";
          }),
        shortName = name.match(/doc\/(\w+)[/.]/),
        demoTitle = null;

      parts.pop();
      shortName = shortName && shortName[1];
      var scriptName = "doc/" + shortName + "/app.js",
        fileRoot = parts.join("");

      for (var i = 0; i < docFiles.length; ++i) {
        var d = docFiles[i];
        if (d.fileName === name) {
          demoTitle = d.title;
        }
      }

      var fxFiles = frameworkFiles;
      if (fs.existsSync(scriptName)) {
        fxFiles = fxFiles.concat([getFileDescrip(scriptName)]);
      }

      callback(null, {
        debug: defaultData.debug,
        version: pkg.version,
        cssExt: defaultData.cssExt,
        jsExt: defaultData.jsExt,
        filePath: name,
        fileRoot: fileRoot,
        fileName: shortName,
        docFiles: docFiles,
        manifest: JSON.stringify(fxFiles.map(function (f) {
          return [
            fileRoot + f[0],
            f[1]
          ];
        })),
        frameworkFiles: defaultData.frameworkFiles,
        demoScriptName: scriptName,
        demoTitle: demoTitle,
        getFile: getFile,
        getDemoScript: getDemoScript
      });
    }))
    .pipe(pug(options))
    .on("error", console.error.bind(console, "PUG ERROR"))
    .pipe(gulp.dest("."));
}

gulp.task("pug:release", function () {
  return pugConfiguration({}, {
    jsExt: ".min.js",
    cssExt: ".min.css",
    frameworkFiles: ["PrimroseDependencies.min.js", "Primrose.min.js"]
  });
});

gulp.task("pug:debug:es5", function () {
  return pugConfiguration({ pretty: true }, debugDataES5);
});

gulp.task("pug:debug:es6", function () {
  return pugConfiguration({ pretty: true }, debugDataES6);
});

gulp.task("jshint", function () {
  return gulp.src(sourceFiles)
    .pipe(jshint({
      multistr: true,
      esnext: true
    }));
});

gulp.task("babel", ["jshint"], function () {
  return gulp.src("src/**/*.js", { base: "./src" })
    .pipe(babel({
      sourceMap: false,
      presets: ["es2015"]
    }))
    .pipe(gulp.dest("./es5"));
});

function concatenate(stream, name, f) {
  var s = stream.pipe(concat(name + ".js", { newLine: "\n" }));
  if (f) {
    s = s.pipe(footer(f));
  }
  return s.pipe(gulp.dest("./"));
}

gulp.task("concat:primrose", ["jshint"], function () {
  return concatenate(gulp.src(sourceFiles)
    .pipe(babel({
      sourceMap: false,
      presets: ["es2015"]
    })), "Primrose", "\nPrimrose.VERSION = \"v" + pkg.version + "\";\nconsole.info(\"Using Primrose v" + pkg.version + ". Find out more at http://www.primrosevr.com\");");
});

gulp.task("concat:dependencies", function () {
  return concatenate(gulp.src(headerFiles), "PrimroseDependencies");
});

gulp.task("carveDocumentation", ["concat:primrose"], function (callback) {
  pliny.carve("Primrose.js", "PrimroseDocumentation.js", callback);
});

gulp.task("jsmin", ["carveDocumentation", "concat:dependencies"], function () {
  return gulp.src(["Primrose*.js", "!*.min.js"])
    .pipe(rename({ suffix: ".min" }))
    .pipe(uglify())
    .pipe(gulp.dest("./"));
});


gulp.task("archive", ["jsmin"], function () {
  return gulp.src(["Primrose*.js", "!PrimroseDependencies*"])
    .pipe(rename(function (file) {
      if (file.basename.indexOf(".min") > -1) {
        file.extname = ".min.js";
        file.basename = file.basename.substring(0, file.basename.length - 4);
      }
      file.basename += "-" + pkg.version;
      return file;
    }))
    .pipe(gulp.dest("archive"));
});

gulp.task("copy:quickstart", ["jsmin"], function () {
  return gulp.src([
    "../HereTTP/bin/x86/Release/StartHere.exe",
    "Primrose*.min.js",
    "doc/models/monitor.*",
    "doc/models/cardboard.*",
    "doc/fonts/helvetiker_regular.typeface.js",
    "doc/audio/wind.ogg",
    "!**/*.blend"])
    .pipe(gulp.dest("quickstart"));
});

gulp.task("debug", ["jshint", "pug:debug:es6"]);
gulp.task("default", ["debug"]);
gulp.task("stage", ["babel", "pug:debug:es5"]);
gulp.task("release", ["pug:release", "copy:quickstart", "archive"]);