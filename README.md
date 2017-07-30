underscore-template-loader
==========================

An Underscore.js and Lodash template loader for Webpack

### Changelog

<br>
 * 0.8: Macros now support object literals as arguments

### Installation

```bash
npm install underscore-template-loader
```

Make sure you have the `underscore` or `lodash` package installed.

### Usage

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

#### Template engine

You can specify an engine to specify the library used when you call underscore methods inside the template if you don't want to rely on the global `_` that is used by default.

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "underscore-template-loader",
                query: {
                    engine: 'lodash',
                }
            }
        ]
    }
};
```

#### Loading templates

```html
<!-- File: hello.html -->
<p>Hello&nbsp;<%=name%></p>
```

```javascript
var compiled = require('./hello.html');
return compiled({name: "world"});
```

#### Prepending filename comment

When debugging a large single page app with the DevTools, it's often hard to find the template that contains a bug. With the following config a HTML comment is prepended to the template with the relative path in it (e.g. `<!-- view/user/edit.html -->`).

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

#### Template settings

You can override the delimiters used to determine data to injected (HTML-escaped or not) or code to evaluate in the templates.

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
                    interpolate: '\\{\\[(.+?)\\]\\}',
                    evaluate: '\\{%([\\s\\S]+?)%\\}',
                    escape: '\\{\\{(.+?)\\}\\}'
                }
            }
        ]
    }
};
```

#### Template imports

[`_.templateSettings.imports`](https://lodash.com/docs#templateSettings-imports) automatically includes variables or functions in your templates. This is useful when you have utility functions that you want to make available to all templates without explicitly passing them in every time the template is used.

```html
<!-- File: hello.html -->
<p><%= greet(name) %></p>
```

```javascript
var _ = require('lodash');
// Imports must be defined before the template is required
_.templateSettings.imports = {
    greet: function(name) {
        return 'Hello, ' + name + '!';
    },
};
var compiled = require('./hello.html');
return compiled({name: "world"});
```

This is enabled by default when `lodash` is the engine used, but can be explicitly toggled using `withImports` option.

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
                    withImports: true,
                }
            }
        ]
    }
};
```

#### Images

In order to load images you must install either the *file-loader* or the *url-loader* package.

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

```html
<!-- Require image using file-loader -->
<img src="img/portrait.jpg">

<!-- Require image using url-loader -->
<img src="img/icon.png">
```

Images with an absolute path are not translated unless a `root` option is defined

```html
<!-- Using root = undefined => no translation -->
<img src="/not_translated.jpg">

<!-- Using root = 'images' => require('images/image.jpg') -->
<img src="/image.jpg">
```

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

Dynamic attributes won't be afected by this behaviour by default.

```html
<!-- Ignore "root" argument if attribute contains a template expression -->
<img src="/img/cat-<%- currentCat.url %>.png" class="cat-img">
```

In order to append the root directory you'll need to specify the `parseDynamicRoutes` argument.

```javascript
module.exports = {
    //...

    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: "underscore-template-loader",
                query: {
                    root: "myapp",
                    parseDynamicRoutes: true
                }
            }
        ]
    }
};
```

```html
<!-- Attribute now translates to "myapp/img/cat-<%- currentCat.url %>.png" -->
<img src="/img/cat-<%- currentCat.url %>.png" class="cat-img">
```

### Macros

Macros allow additional features like including templates or inserting custom text in compiled templates.

#### The *require* macro

The `require` macro expects a path to a underscore template. The macro is then translated into a webpack require expression that evaluates the template using the same arguments.

```html
<h4>Profile</h4>

Name: <strong><%=name%></strong>
<br>
Surname: <strong><%=surname%></strong>
<div class="profile-details">
    @require('profile-details.html')
</div>
```

This macro also supports an object literal as an additional argument.

```html
<div class="top-section">
    @require('header.html', {"title": "First Section"})
</div>
```

#### The *include* macro

While the `require` macro expects a resource that returns a function, the `include` macro can be used for resources that return plain text. For example, we can include text loaded through the `html-loader` directly in our template.

```html
<div class="wiki">
    <h3>Introduction</h3>
    @include('intro.htm')
    <h3>Authors</h3>
    @include('authors.htm')
</div>
```

#### *br* and *nl*

The `br` and `nl` macros insert a `<br>` tag and a new line respectively. They accept a optional argument with the amount of strings to insert.

```html
<p>Lorem ipsum</p>
@br(3)
<p>Sit amet</p>
@nl()
```

#### Custom macros

We can include additional macros by defining them in the webpack configuration file. Remember that the value returned by a macro is inserted as plain javascript, so in order to insert a custom text we need to use nested quotes. For example, let's say that we want a macro that includes a copyright string in our template.

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
            return "'<p>Copyright FakeCorp 2014 - 2016</p>'";
        }
    }
}
```

We then invoke this macro from within the template as usual.

```html
<footer>
    @copyright()
</footer>
```

#### Disabling macros

You can disable macros if you are a bit unsure about their usage or just simply want faster processing. This is achieved by setting the `parseMacros` options to false.

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

#### Arguments

Macros can accept an arbitrary number of arguments of different types: boolean, strings, numbers an object literals are supported.

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

```html
@header(1, 'Welcome')
<p>Lorem ipsum</p>
@header(3, 'Contents')
<p>Sit amet</p>
```

#### Escaping

Macro expressions can be escaped with the `\` character.

```html
@br(3)
\@nl()
@br()
```

Translates to

```html
<br><br><br>
@nl()
<br>
```

#### Known issues

 * Trying to use different template settings (interpolate, escape, evaluate) for different extensions. Underscore / Lodash template settings are defined globally.

### License

Released under the MIT license.
