# Non compromise ES6

Development setup for authoring application without requirement of builders, bundlers and clis .
Before you will go forward please read: [A Future Without Webpack](https://www.pikapkg.com/blog/pika-web-a-future-without-webpack).
Please also look at the [Open WC](https://open-wc.org/) project. 

### Goal
Because latest browsers supports most of critical parts of ES6 standard including es modules and dynamic `import()`, 
there is no need anymore to use compilers/transpilers/bundlere/loaders, super fancy complicated angular/react/... cli 
and other ...ers durring regular day to day development process.

The goal of this project is to establish development setup which will allows developer to do not be forced to usage of 
any tools during day to day javascript development. There are only required two tools, text editor 
(vim, notepad, ... or some IDE) and modern browser.      

### Key features 
* Clean pure es6 code with es6 modules 
* Non bundling/compiling required during development workflow, write your code and just (auto) reload in browser.
* UI computerization by use of [lit-element](https://lit-element.polymer-project.org/) 
* Dev server with live reload by use of [nodemon](https://github.com/remy/nodemon) and [browsersync](http://browsersync.io)
* (Snapshot) testing thought [karma](http://karma-runner.github.io) also without building & bundling
* Es6 dependencies loading thought [Pika](https://www.pikapkg.com/)
* Commonjs dependencies loading thought wrapping them to es6 modules (dummy tool provided)
* Typechecking thought [typescript](https://www.typescriptlang.org/) and `@jsdoc` annotations
* Production bundle build thought [webpack](https://webpack.js.org/) and [typescript](https://www.typescriptlang.org/)
loader for compile to es5. 
* IE11 support (after bundling)

### Caveats    
* Support of commonjs 3party dependencies is very limited. For each such module (not package), we have to define all 
imports and exports. Please consider to use alternatives which are natively supports es6 (modules) please look at   
[Pika](https://www.pikapkg.com/)
* To support the typechecking of 3party dependencies, for each of dependency we need to provide proxy `.d.ts` file 
* For resolving all absolute dependencies for production build we need to provide mapping in browse field in `package.json` 

### Missing
* Api docs generation - there is still incompatibilities between [jsdoc](https://github.com/jsdoc/jsdoc) and 
[typescript](https://www.typescriptlang.org/) which cause some docs generation errors eg: 
[Improve module ergonomics](https://github.com/jsdoc/jsdoc/issues/1645)
* Templates minification - there is no tool for optimizations of `lit-html` templates and simple work with webpack     
* Coverage - unfortunately karma runner is using older version of Istanbul which doesn't support es6 instrumenting. 
There is opened [PR](https://github.com/karma-runner/karma-coverage/pull/377) which will solve this problem. 
* Demoing - as storybook is not clean es6 solution I do not want to introduce it for now, demoing should be super simple 
without requirement of any build/bundling  
* WallebyJs

### Related projects
* [Open WC](https://open-wc.org/)
* [Pika](https://www.pikapkg.com/)
* [IE 11 Countdown](https://gabriellaroche.dev/ie11-death-countdown/)
