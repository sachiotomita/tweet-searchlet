/*
 * Copyright 2014, Tsuyusato Kitsune (@make_now_just).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This script is template of seachlet. So, this script cannot run for alone.
 *
 * Please executing:
 *
 *     $ node build.js
 */

var
input = $input_pattern$;

var
global = ('global', eval)('this'), //global eval magic!
OAuth = global.OAuth;
//when OAuth.js didn't loaded, load OAuth.js
if (typeof global.OAuth === 'undefined') OAuth = global.OAuth = _OAuth();

var
base = 'https://api.twitter.com/1.1',
api = '/statuses/update',
url = base + api + '.json',
parameters = [
  ['status', input],
],

accessor = {
  consumerKey:    $consumer_key$,
  consumerSecret: $consumer_secret$,
  token:          $access_token_key$,
  tokenSecret:    $access_token_secret$,
},
message = {
  method: 'POST',
  action: url,
  parameters: parameters,
};

//complete parameters for OAuth
OAuth.completeRequest(message, accessor);

var
form = document.createElement('form'),
ifrm = document.createElement('iframe'),
name = 'tweet-on-location-bar-' + Date.now(), flag;

//setting form
form.action = message.action;
form.method = message.method;
form.target = name;

//append parameters
message.parameters.forEach(function (param) {
  var
  input = document.createElement('input');
  
  input.type = 'hidden';
  input.name = param[0];
  input.value = param[1];
  
  form.appendChild(input);
});

//setting iframe
ifrm.name = name;
ifrm.src = 'about:blank';

flag = 0;
ifrm.onload = function () {
  if (flag++ === 0) { //load "about:blank"
    setTimeout(function () { form.submit(); }, 0);
  } else {            //load update.json
    form.parentNode.removeChild(form);
    ifrm.parentNode.removeChild(ifrm);
  }
};

//append to html
document.body.appendChild(form);
document.body.appendChild(ifrm);

