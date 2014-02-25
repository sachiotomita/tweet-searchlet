//requires
var
fs       = require('fs'),
qs       = require('qs'),
async    = require('async'),
_        = require('lodash'),
prompt   = require('prompt').start(),
uglify   = require('uglify-js'),
ntwitter = require('ntwitter');

//constants
var
TWEET_JS = './tweet.js',
LIBS = ['sha1.js', 'OAuth.js'];

//processing command line arguments
var
program = require('commander');

program
  .version('0.1.0')
  .option('-i, --input-pattern <pattern>', 'string to replace INPUT_PATTERN of tweet.js (default: "%s")', String)
  .option('-o, --output <filename>', 'output filename (default: tweet.<screen_name>.searchlet.js)', String)
  .option('-c, --config <filename>', 'configuration filename (default: ./config.json)', String)
  .parse(process.argv);

_.defaults(program, {
  inputPattern: '"%s"',
  output: 'tweet.<screen_name>.js',
  config: './config.json',
});

//main
var
config = require(program.config);

async.waterfall([
  function checkAuthorized(next) {
    //check authorized
    if (config.access_token_key && config.access_token_secret) {
      //already authorized
      next(null);
    } else {
      //no authorized
      var
      twitter = new ntwitter(config);
      
      //start authorization
      async.waterfall([
        function getRequestToken(next) {
          twitter.oauth.getOAuthRequestToken(next);
        },
        function promptPin(token, tokenSecret, params, next) {
          console.log('authorize on browser at\n  %s', twitter.options.authorize_url + '?' + qs.stringify({oauth_token: token}));
          
          prompt.get(['pin'], function () {
            next.apply(this, _.toArray(arguments).concat(token, tokenSecret));
          });
        },
        function getAccessToken(input, token, tokenSecret, next) {
          twitter.oauth.getOAuthAccessToken(token, tokenSecret, input.pin, next);
        },
        function setConfig(access_token_key, access_token_secret, params, next) {
          config.access_token_key    = access_token_key;
          config.access_token_secret = access_token_secret;
          
          next(null);
        },
      ], next);
    }
  },
  
  function getScreenName(next) {
    var
    twitter = new ntwitter(config);
    
    async.waterfall([
      function verifyCredentials(next) {
        twitter.verifyCredentials(next);
      },
      function pluckScreenName(res, next) {
        var
        screenName = res.screen_name;
        program.output = program.output.replace('<screen_name>', screenName)
        
        next(null);
      },
    ], next);
  },
  
  function readFiles(next) {
    var
    readFile = _.curry(fs.readFile),
    tasks = { tweetJS: readFile(TWEET_JS, 'utf8') };
    
    LIBS.forEach(function (lib) {
      tasks[lib] = readFile('lib/' + lib, 'utf8');
    });
    
    async.parallel(tasks, next);
  },
  
  function concatFiles(files, next) {
    var
    src = '(function (_OAuth) {\n';
    src += files.tweetJS;
    src += '\n})(function () {\n';
    
    LIBS.forEach(function (lib) {
      src += files[lib] + '\n';
    });
    
    src += 'return OAuth;\n';
    src += '});';
    
    next(null, src);
  },
  
  function compressTweetJS(src, next) {
    var
    ast = uglify.parse(src);
    
    ast.figure_out_scope();
    ast.compute_char_frequency();
    ast.mangle_names();
    
    next(null, ast.print_to_string());
  },
  
  function replaceTweetJS(compressedSrc, next) {
    compressedSrc = compressedSrc.replace(/%/g, ' % '); //escape for searchlet
    compressedSrc = compressedSrc.replace('$input_pattern$', program.inputPattern);
    _.each(config, function (value, key) {
      compressedSrc = compressedSrc.replace('$' + key + '$', JSON.stringify(value));
    });
    next(null, compressedSrc);
  },
  
  function writeTweetCustomJS(replacedSrc, next) {
    replacedSrc = 'javascript:' + replacedSrc; //append "javascript:" pseudo schema
    fs.writeFile(program.output, replacedSrc, 'utf8', next);
  },
], function (err) {
  if (err) return console.error(err);
  
  console.log('successed to generate=> %s', program.output);
});
