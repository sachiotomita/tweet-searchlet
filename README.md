#tweet searchlet

let's tweet your browser's search bar!

##What is searchlet?

the searchlet is a program running on search bar (location bar) of browser.

this is incernated by "javascript:" pseudo schema.

Using sample:

![Searchlet sample](https://raw.github.com/MakeNowJust/tweet-searchlet/master/image/tweet_searchlet.gif)

##How use tweet searchlet?

prerequires, install git and node.js.

```
$ git clone https://github.com/MakeNowJust/tweet-searchlet.git
$ cd tweet-searchlet
$ npm install
```

and,

```
$ node build.js
authorize on browser at
  https://api.twitter.com/oauth/authorize?oauth_token=**********************
prompt: pin:  *******
successed to generate=> tweet.your_screen_name.js
```

and you open Chrome `chrome://settings/searchEngines`, paste `tweet.your_screen_name.js`'s content as search engine's URL.

##Custom build

```
$ node build.js --help

  Usage: build.js [options]

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -i, --input-pattern <pattern>  string to replace INPUT_PATTERN of tweet.js (default: "%s")
    -o, --output <filename>        output filename (default: tweet.<screen_name>.js)
    -c, --config <filename>        configuration filename (default: ./config.json)
```

for example, when you want bookmarklet version, you should do:

```
$ node build.js -i prompt('tweet','') -o tweet.<screen_name>.bookmarklet.js
```

##License

this script licensed under the Apache-2.0.

##Thanks

this script includes these libraries:

  * OAuth.js https://code.google.com/p/oauth/
  * sha1.js

##Author

Tsuyusato Kitsune (@make_now_just) <makenowjust@myopera.com>
