module.exports = {
    outDir: 'web_modules',
    modules: [
        {from: 'storeon', to: 'storeon.js'},
        {from: 'storeon/devtools', to: 'storeonDevTools.js'},
        {from: 'storeon/devtools/logger.browser', to: 'storeonLoggerBrowser.js'}
    ]
};
