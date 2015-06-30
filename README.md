underscore-template-loader
==========================

A Underscore template loader for Webpack

<br/>
###Usage

<br/>
**Installation**
```bash
$ npm install underscore-template-loader
```

<br/>
**Add loader**
```javascript
module.exports = {
    //...
    loaders: [
        //...
        { test: /\.html/, loader: "underscore-template-loader" }
    ]
};
```
<br/>
**Set underscore template settings**
```javascript
module.exports = {
    //...
    loaders: [
        //...
        {
          test: /\.html/,
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
**Loading templates**

```html
<!-- file: hello.html -->
<p>Hello&nbsp;<%=name%></p>
```

```javascript
var compiled = require('./hello.html');
return compiled({name: "world"});
```

<br/>
**Include tag**


```html
<!-- file: main.html -->
<p>Hello, <!--include message.html--></p>
```


```html
<!-- file: message.html -->
<em>how are you?</em>
```

<br/>
###License

Released under the MIT license.