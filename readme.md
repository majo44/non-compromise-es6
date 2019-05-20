# Non compromise ES6

Development setup for authoring application without requirement of builders, bundlers and clis .
Before you will go forward please read: [A Future Without Webpack](https://www.pikapkg.com/blog/pika-web-a-future-without-webpack)

### Goal
Because latest browsers supports most of critical parts of ES6 standard including es modules and dynamic `import()`, 
there is no need anymore to use compilers/transpilers/bundlere/loaders, super fancy complicated angular/react/... cli 
and other ...ers durring regular day to day development process.

The goal of this project is to establish development setup which will allows developer to do not be forced to usage of 
any tools during day to day javascript development. There are only required two tools, text editor 
(vim, notepad, ... or some IDE) and modern browser.        

### Introduction
> We strongly believe that staying close to browser standards will be the best long term investment for your code. 
It is the basis for all our recommendations, and it means that sometimes we will not recommend a popular feature or 
functionality. It also means we can be faster to adopt and recommend new browser standards.
*[Open WC](https://open-wc.org/developing/#browser-standards)*

This setup is based on latest web standards but is supports also legacy browsers (tested with IE11). The UI layer is 
based on Web Components. UI Components are using [lit-element](https://lit-element.polymer-project.org/) library.. 



### Developing
#### Dependencies
Dependencies are the biggest challenge. Currently a lot of `npm` packages do not deliver the es6 
version of code. That ones which are do that, are now available by the [@pika/web](https://www.pikapkg.com/),
for rest we have to find alternative or use some workarounds.     
* es6 dependencies - to install bundled es6 version the [@pika/web](https://www.pikapkg.com/) is used.
* commonjs dependencies - there is no any available tool which simple converts commonjs to es6 modules, 
for simple cases there is small tool `tools/prepare/toesm.js` which is configured by `toesm.config.js` 
and simple wraps the commonjs code to closure where `require` and `module.exports` are mocked. 
This tool is very dummy so for each wrapped module you have to by self describe all dependencies 
and exports.
#### IDE
#### Dev server
#### Types
### Linting
#### ESLint
#### Type checking
I strongly believe that strong typing helps a lot during the development and maintenance, especially in large projects 
with large, distributed team. For last few years I used Typescript, and  
  

### Testing
#### Testing Helpers
#### Snapshot testing
#### Karma


### Building
#### Webpack



### Missing
* Templates minification - there is no any lib or tool for optimizations of `lit-html` templates    
* Coverage - unfortunately karma runner is using older version of Istanbul which doesn't support es6. There is opened 
[PR](https://github.com/karma-runner/karma-coverage/pull/377) which will solve the problem 
* WallebyJs     


### Related projects
* [Open WC](https://open-wc.org/)
* [Pika]()
* [IE 11 Countdown](https://gabriellaroche.dev/ie11-death-countdown/)
