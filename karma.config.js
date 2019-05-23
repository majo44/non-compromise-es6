const path = require('path');
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai', 'snapshot', 'mocha-snapshot', 'sinon'],
        files: [
            { pattern: 'tools/testing/chai-snapshot.js', type: 'module' },
            'app/src/**/__snapshots__/**/*.md',
            { pattern: 'app/src/**/*.spec.js', type: 'module' },
            {
                pattern: 'app/src/**/*.js', type: 'module', served: true, included: false,
            },
            {
                pattern: 'web_modules/**/*.js', type: 'module', served: true, included: false,
            },
        ],
        preprocessors: {
            '**/__snapshots__/**/*.md': ['snapshot'],
            '/app/src/**/*.js': ['coverage'],
        },
        reporters: ['progress', 'mocha', 'coverage-istanbul'],
        port: 9876, // karma web server port
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true,
        // singleRun: false, // Karma captures browsers, runs the tests and exits
        concurrency: Infinity,
        plugins: [
            // resolve plugins relative to this config so that they don't always need to exist
            // at the top level
            require.resolve('karma-mocha'),
            require.resolve('karma-chai'),
            require.resolve('karma-sinon'),
            require.resolve('karma-mocha-reporter'),
            require.resolve('karma-coverage'),
            require.resolve('karma-coverage-istanbul-reporter'),
            require.resolve('karma-static'),
            require.resolve('karma-snapshot'),
            require.resolve('karma-mocha-snapshot'),
            require.resolve('karma-chrome-launcher'),
            // fallback: resolve any karma- plugins
            // 'karma-*',
        ],
        // ## code coverage config
        coverageIstanbulReporter: {
            reports: ['html', 'lcovonly', 'text-summary'],
            dir: 'coverage',
            combineBrowserReports: true,
            skipFilesWithNoCoverage: false,
            // thresholds: {
            //     global: {
            //         statements: 80,
            //         branches: 80,
            //         functions: 80,
            //         lines: 80,
            //     },
            // },
        },
        mochaReporter: {
            showDiff: true,
        },
        snapshot: {
            update: true,
            prune: false,
            // only warn about unused snapshots when running all tests
            limitUnusedSnapshotsInWarning: config.grep ? 0 : -1,
            pathResolver(basePath, suiteName) {
                return path.join(basePath, 'app/src/__snapshots__', `${suiteName}.md`);
            },
        },
        middleware: ['static'],
        static: {
            path: path.join(__dirname),
        },
    });
};
