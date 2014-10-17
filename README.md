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
**Loading templates**

```html
<p>Hello&nbsp;<%=name%></p>
```

```javascript
var compiled = require('./hello.html');
return compiled({name: "world"});
```

<br/>
###License

Released under the MIT license.