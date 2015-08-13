underscore-template-loader
==========================

An Underscore.js template loader for Webpack

<br/>
###Installation

<br/>
```bash
$ npm install underscore-template-loader
```

<br/>
###Usage


<br/>
```javascript
module.exports = {
    //...
    loaders: [
        //...
        { test: /\.html$/, loader: "underscore-template-loader" }
    ]
};
```

<br/>
####Loading templates

<br/>
```html
<!-- file: hello.html -->
<p>Hello&nbsp;<%=name%></p>
```

```javascript
var compiled = require('./hello.html');
return compiled({name: "world"});
```

<br/>
####Template settings

<br>
```javascript
module.exports = {
    //...
    loaders: [
        //...
        {
          test: /\.html$/,
          loader: "underscore-template-loader",
          query: {
              interpolate : '\\{\\[(.+?)\\]\\}',
              evaluate: '\\{%([\\s\\S]+?)%\\}',
              escape : '\\{\\{(.+?)\\}\\}'
          }
        }
    ]
};
```

<br/>
####Include tag

<br/>
```html
<!-- file: main.html -->
<p>Hello, <@include message.html></p>
```


```html
<!-- file: message.html -->
<em>how are you?</em>
```

<br/>
Include tag can be overrided through the *includeRegex* argument.

<br/>
```javascript
module.exports = {
    //...
    loaders: [
        //...
        {
          test: /\.html$/,
          loader: "underscore-template-loader",
          query: {
              includeRegex: '<#include\\s+([\\/\\w\\.]*?[\\w]+\\.[\\w]+)>'
          }
        }
    ]
};
```

<br/>
####Images

<br/>
In order to load images you must install either the *file-loader* or the *url-loader* packages.

```javascript
module.exports = {
    //...
    loaders: [
        //...
        { test: /\.html/, loader: "underscore-template-loader" },
        { test: /\.jpg$/, loader: "file-loader" },
        { test: /\.png$/, loader: "url-loader?mimetype=image/png" },
    ]
};
```

<br>

```html
<!-- Require image using file-loader -->
<img src="img/portrait.jpg">

<!-- Require image using url-loader -->
<img src="img/icon.png">
```

<br/>
Images with an absolute path are not translated unless a *root* argument is defined

```html
<!-- Using root = undefined => no translation -->
<img src="/not_translated.jpg">

<!-- Using root = 'images' => require('images/image.jpg') -->
<img src="/image.jpg">
```

<br>
In order to deactivate image processing define *attributes* as an empty array.

```javascript
module.exports = {
    //...
    loaders: [
        //...
        {
            test: /\.html$/,
            loader: "underscore-template-loader",
            query: {
                attributes: []
            }
        }
    ]
};
```

<br/>

You could also add which attributes need to be processed in the form of pairs *tag:attribute*.

```javascript
module.exports = {
    //...
    loaders: [
        //...
        {
            test: /\.html$/,
            loader: "underscore-template-loader",
            query: {
                attributes: ['img:src', 'x-img:src']
            }
        }
    ]
};
```

<br/>
####Known issues

<br/>
 * Trying to use different template settings (interpolate, escape, evaluate) for different extensions. Underscore template settings are defined globally.

<br/>
###License

Released under the MIT license.