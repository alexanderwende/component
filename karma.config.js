module.exports = function (config) {

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: './',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'karma-typescript'],


        // list of files / patterns to load in the browser
        files: [
            { pattern: 'src/**/*.ts' }
        ],


        // list of files / patterns to exclude
        // exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.ts': ['karma-typescript']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'karma-typescript'],


        karmaTypescriptConfig: {
            bundlerOptions: {
                entrypoints: /\.spec\.ts$/,
                // needed for importing es6 modules from npm packages
                transforms: [require('karma-typescript-es6-transform')()],
            },
            compilerOptions: {
                // karma doesn't like es6 modules, so we compile to commonjs
                module: 'commonjs',
                declaration: false,
                declarationMap: false
            },
            include: [
                'src/**/*.ts'
            ],
            coverageOptions: {
                exclude: [
                    // we don't cover declaration or test files
                    /\.(d|spec|test)\.ts/i,
                    // we don't want to cover barrel files
                    /index.ts/
                ],
            },
            reports: {
                'html': {
                    directory: 'coverage',
                    subdirectory: () => ''
                },
                'lcovonly': {
                    directory: 'coverage',
                    subdirectory: () => '',
                    filename: 'lcov.info'
                },
                'text': null
            },
            tsconfig: './tsconfig.json'
        },


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['ChromeHeadless'],


        // custom chrome launcher for remote debugging tests
        customLaunchers: {
            ChromeDebug: {
                base: 'ChromeHeadless',
                flags: ['--remote-debugging-port=9222'],
                debug: true
            }
        },


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
