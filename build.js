/*
 * Copyright (C) 2025 San Francisco Estuary Institute (SFEI)
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

//------------------------------------------------------------------------------------------------------------
// Build Parameters
//------------------------------------------------------------------------------------------------------------
    // directories
var srcDir   = "src", 
    buildDir = "build", 
    devDir   = "/var/www/explorer-devls.adaptingtorisingtides.org", 
    stageDir = "/var/www/explorer-staging.adaptingtorisingtides.org", 
    distDir  = "/var/www/explorer.adaptingtorisingtides.org", 
    // locations of configs to copy (relative to this script)
    configs = {
        production:  "./configs/prod.ini", 
        staging:     "./configs/staging.ini", 
        development: "./configs/dev.ini"
    }, 
    // location of php files (relative to this script)
    phpPath = "./php", 
    // ignore list (assumed in src folder) -- can handle some wildcards but limited
    ignore  = [
        "local_config.ini", 
        "*/node_modules"
    ], 
    // additional ignores for production
    ignoreProd = [
        //"start_server.bat", 
        "css", 
        "js"
    ], 
    // required copies for production build
    required = [
        "js/lib/require.js"
    ], 
    // all common libraries used
    libraries = [
        'domReady', 
        'text', 
        'jquery', 
        'd3', 
        "dateFormat", 
        'common', 
        "common.table", 
        'OpenLayers', 
        "init/rconfig"
    ], 
    // build config (assumed in src folder)
    builds = {
        // will build in reverse order just FYI
        "print.js": {
            mainConfigFile: "js/init/rconfig.js",           // require config file
            out:            "print.js",                     // output name, in dist folder
            baseUrl:        "js",                           // do I need this? already defined in config. (todo: look into it)
            name:           "init/print",                   // module to start concatenation
            exclude:        libraries.concat(["apps/slr"])  // exclude common libraries, and in this case the SLR app call
        }, 
        "slr.js": {
            mainConfigFile: "js/init/rconfig.js", 
            out:            "slr.js", 
            baseUrl:        "js", 
            name:           "init/slr", 
            exclude:        libraries
        }, 
        "site.js": {
            mainConfigFile: "js/init/rconfig.js", 
            out:            "site.js", 
            baseUrl:        "js", 
            name:           "init/site", 
            exclude:        libraries
        }, 
        'libs.js': {
            mainConfigFile: "js/init/rconfig.js", 
            out:            "libs.js", 
            baseUrl:        "js", 
            name:           "init/rconfig", 
            include:        libraries
        }, 
        "style.css": {
            cssIn:          "css/style.css", 
            out:            "style.css", 
            optimizeCss:    "default"
        }
    };


//------------------------------------------------------------------------------------------------------------
// Build Script
//------------------------------------------------------------------------------------------------------------
// pull in libraries
const requirejs = require('requirejs'), 
      path      = require('path'), 
      fs        = require('fs-extra'), 
      rl        = require('readline').createInterface({input: process.stdin, output: process.stdout}), 
      matches   = require('./matches.js');

// get any passed arguments
var args = {};
for(var i = 0; i < process.argv.length; i++) {
    if(process.argv[i].startsWith("-")) {
        var parts = process.argv[i].replace(/^\-+/g, '').split("=");
        args[parts[0]] = parts[1];
    }
}
// determine environment from arguments
var env = "env" in args ? args["env"] : "development", 
    isProductionEnv = env === "production" || env === "prod", 
    isStagingEnv = !isProductionEnv && env === "staging", 
    compileScripts = isProductionEnv || isStagingEnv;
// determine output directory from arguments
outputDir = isProductionEnv ? distDir : (isStagingEnv ? stageDir : devDir);
outputDir = path.resolve("o" in args ? args["o"] : outputDir);
// other options
var passwordProtect = "pp" in args, 
    configPath = configs[isProductionEnv ? "production" : isStagingEnv ? "staging" : "development"];

// prep ignore list
if(compileScripts) ignore = ignore.concat(ignoreProd);
//              remap     source dir      split by folders       case insensitive
ignore = ignore.map(ig => [srcDir].concat(ig.split(/[\\\/]/).map(s => s.toLowerCase())));

// Create build functions here (to be run later as callbacks)
var finishBuild = function() {
        console.log("Copying to output location..");
        // empty dist dir
        fs.ensureDirSync(outputDir);
        fs.emptyDirSync(outputDir);
        // copy src folder
        fs.copySync(srcDir, outputDir, {
            overwrite: true, 
            filter: function(input) {
                var fParts = input.split(/[\\\/]/).map(s => s.toLowerCase());
                for(var i = 0; i < ignore.length; i++) {
                    if(matches(ignore[i], fParts)) {
                        return false;
                    }
                }
                return true;
            }
        });
        // move build dir if necessary
        if(compileScripts) {
            fs.moveSync(buildDir, path.join(outputDir, buildDir));
        }
        // write local_config.ini
        console.log("Setting local config..");
        fs.writeFile(
            path.join(outputDir, "local_config.ini"), 
            (
                "[Environment]\n" + 
                "ini_path = \"" + path.resolve(configPath) + "\"\n" + 
                "root_php_path = \"" + path.resolve(phpPath) + "\""
            )
        );
        // add password protection if called for
        if(passwordProtect) {
            fs.appendFile(
                path.join(outputDir, ".htaccess"), 
                "\nAuthType Basic\nAuthName \"Password Protected Area\"\nAuthUserFile " + path.resolve("./") + "/.htpasswd\nRequire valid-user"
            );
        }
    }, 
    startBuild = function() {
        if(!compileScripts) return finishBuild();
        // create temp build dir and copy required folders
        fs.ensureDirSync(buildDir);
        fs.emptyDirSync(buildDir);
        console.log("Copying required files..");
        for(var i = 0; i < required.length; i++) {
            fs.copySync(
                path.join(srcDir, required[i]), 
                path.join(buildDir, path.basename(required[i]))
            );
        }
        // create build processes
        var lastFunction = null;
        for(var key in builds) {
            lastFunction = (function(k, c, f) {  // begin IIFE constructor
                return function(onComplete) {
                    // prepare config then optimize
                    c.out = path.join(buildDir, c.out);
                    if(c.mainConfigFile) c.mainConfigFile = path.join(srcDir, c.mainConfigFile);
                    if(c.baseUrl)        c.baseUrl        = path.join(srcDir, c.baseUrl);
                    if(c.cssIn)          c.cssIn          = path.join(srcDir, c.cssIn);
                    requirejs.optimize(c, function(buildResponse) {
                        console.log(buildResponse);
                        (f ? f(onComplete) : onComplete());  // next function or complete
                    }, function(err) {
                        console.log(err);
                        throw err;
                    });
                };
            })(key, builds[key], lastFunction);  // end IIFE constructor
        }
        console.log("Building..");
        lastFunction(finishBuild);
    };

// confirm
console.log("Building for environment: " + (isProductionEnv ? "production" : (isStagingEnv ? "staging" : "development")));
console.log("  Output directory: " + outputDir);
console.log("  Compiling scripts: " + (compileScripts ? "yes" : "no"));
console.log("  Password protect: " + (passwordProtect ? "yes" : "no"));
rl.question("Continue? yes/no: ", function(res) {
    rl.close();
    res = res.toLowerCase().trim();
    if(res === 'yes' || res === 'y') {
        console.log("");
        startBuild();
    } else if(res === 'no' || res === 'n') {
        console.log("Canceled.");
    } else {
        console.log("Unrecognized response. Canceled.");
    }
});