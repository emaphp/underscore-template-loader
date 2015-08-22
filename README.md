underscore-template-loader
==========================

An Underscore.js and Lodash template loader for Webpack

<br>
###Installation

<br>
```bash
npm install underscore-template-loader
```

<br>
Make sure you have the `underscore` or `lodash` package installed.

<br>
###Usage

<br>
```javascript
module.exports = {
    //...
    module: {
        loaders: [
            { test: /\.html$/, loader: "underscore-template-loader" }
        ]
    },
};
```

<br>
####Loading templates

<br>
```html
<!-- File: hello.html -->
<p>Hello&nbsp;<%=name%></p>
```

<br>
```javascript
var compiled = require('./hello.html');
return compiled({name: "world"});
```

<br>
####Prepending filename comment

<br>
When debugging a large single page app with the DevTools, it's often hard to find the template that contains a bug. With the following config a HTML comment is prepended to the template with the relative path in it (e.g. `<!-- view/user/edit.html -->`).

<br>
```javascript
module.exports = {
    //...
    
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "underscore-template-loader",
                query: {
                    prependFilenameComment: __dirname,
                }
            }
        ]
    }
};
```

<br>
####Template settings

<br>
```javascript
module.exports = {
    //...
    
    module: {
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
    }
};
```

<br>
####Images

<br>
In order to load images you must install either the *file-loader* or the *url-loader* package.

<br>
```javascript
module.exports = {
    //...

    module: {
        loaders: [
            { test: /\.html$/, loader: "underscore-template-loader" },
            { test: /\.jpg$/, loader: "file-loader" },
            { test: /\.png$/, loader: "url-loader?mimetype=image/png" },
        ]
    }
};
```

<br>
```html
<!-- Require image using file-loader -->
<img src="img/portrait.jpg">

<!-- Require image using url-loader -->
<img src="img/icon.png">
```

<br>
Images with an absolute path are not translated unless a `root` option is defined

<br>
```html
<!-- Using root = undefined => no translation -->
<img src="/not_translated.jpg">

<!-- Using root = 'images' => require('images/image.jpg') -->
<img src="/image.jpg">
```

<br>
In order to deactivate image processing define `attributes` as an empty array.

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "underscore-template-loader",
                query: {
                    attributes: []
                }
            }
        ]
    }
};
```

<br>
You could also add which attributes need to be processed in the form of pairs *tag:attribute*.

```javascript
module.exports = {
    //...

    module: {
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
    }
};
```

<br>
###Macros

<br>
Macros allow additional features like including templates or inserting custom text in compiled templates.

<br>
####The *require* macro

<br>
The `require` macro expects a path to a underscore template. The macro is then translated into a webpack require expression that evaluates the template using the same arguments.

<br>
```html
<h4>Profile</h4>

Name: <strong><%=name%></strong>
<br>
Surname: <strong><%=surname%></strong>
<div class="profile-details">
    @require('profile-details.html')
</div>
```

<br>
####The *include* macro

<br>
While the `require` macro expects a resource that returns a function, the `include` macro can be used for resources that return plain text. For example, we can include text loaded through the `html-loader` directly in our template.

```html
<div class="wiki">
    <h3>Introduction</h3>
    @include('intro.htm')
    <h3>Authors</h3>
    @include('authors.htm')
</div>
```

<br>
####*br* and *nl*

<br>
The `br` and `nl` macros insert a `<br>` tag and a new line respectively. They accept a optional argument with the amount of strings to insert.

```html
<p>Lorem ipsum</p>
@br(3)
<p>Sit amet</p>
@nl()
```

<br>
####Custom macros

<br>
We can include additional macros by defining them in the webpack configuration file. Remember that the value returned by a macro is inserted as plain javascript, so in order to insert a custom text we need to use nested quotes. For example, let's say that we want a macro that includes a copyright string in our template.

<br>
```javascript
// File: webpack.config.js
module.exports = {
    // ...

    module: {
        loaders: {
            // ...
            { test: /\.html$/, loader: "underscore-template-loader" },
        }
    },
    
    macros: {
        copyright: function () {
            return "'<p>Copyright FakeCorp 2014 - 2015</p>'";
        }
    }
}
```

<br>
We then invoke this macro from within the template as usual.

<br>
```html
<footer>
    @copyright()
</footer>
```

<br>
####Disabling macros

<br>
You can disable macros if you are a bit unsure about their usage or just simply want faster processing. This is achieved by setting the `parseMacros` options to false.

<br>
```javascript
module.exports = {
    // ...
    
    module: {
        loaders: {
            // ...
            {
                test: /\.html$/,
                loader: "underscore-template-loader",
                query: {
                    parseMacros: false
                }
            },
        }
    }
}
```

<br>
####Arguments

<br>
Macros can accept an arbitrary number of arguments. Only boolean, strings and numeric types are supported.

<br>
```javascript
// File: webpack.config.js
module.exports = {
    // ...

    module: {
        loaders: {
            // ...
            { test: /\.html$/, loader: "underscore-template-loader" },
        }
    },
    
    macros: {
        header: function (size, content) {
            return "'<h" + size + ">" + content + "</h" + size + ">'";
        }
    }
}
```

<br>
```html
@header(1, 'Welcome')
<p>Lorem ipsum</p>
@header(3, 'Contents')
<p>Sit amet</p>
```

<br>
####Escaping

<br>
Macro expressions can be escaped with the `\` character.

<br>
```html
@br(3)
\@nl()
@br()
```

<br>
Translates to

<br>
```html
<br><br><br>
@nl()
<br>
```

<br>
####Known issues

<br>
 * Trying to use different template settings (interpolate, escape, evaluate) for different extensions. Underscore / Lodash template settings are defined globally.

<br>
###License

Released under the MIT license.
