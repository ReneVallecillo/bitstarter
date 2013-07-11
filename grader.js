#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://google.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    } 

    return instr;
};

var assertURLExists = function(url) {
    rest.get(url).on('complete',function(result) {
        if (result instanceof Error) {
          console.log("%s does not exist. Exiting.", url);
          process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
        }else{
          read(result,'url', program.checks);
        }
        
    });
    var url = url.toString();
    return url
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioHtmlData = function(htmlfile) {
    return cheerio.load(htmlfile);
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};


function read(name,type, checksfile){
  console.log("reading")
    var checks = loadChecks(checksfile).sort();
    var out = {};

    if ( type == 'file'){
      file = cheerioHtmlFile(name);
      check(file,checks);

    }else if(type == 'url'){
          file = cheerioHtmlData(name);
          check(file,checks);
    }
}

function check(file,checks){
  var out = {};
  for(var ii in checks) {
        var present = file(checks[ii]).length > 0;
        out[checks[ii]] = present;
  }
  console.log(out);
}


if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to test', clone(assertURLExists), URL_DEFAULT)
        .parse(process.argv);

        if(program.rawArgs[4]=='--file'){
          read(program.file,'file', program.checks);
        }
 } else {
    exports.checkHtmlFile = checkHtmlFile;
}