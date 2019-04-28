module.exports = function(config) {
    config.set({
        //root path location to resolve paths defined in files and exclude
        basePath: '',
        //files/patterns to exclude from loaded files
        exclude: [],
        //files/patterns to load in the browser
        files: [
            './node_modules/jquery/dist/jquery.js',
            './node_modules/angular/angular.js',
            './node_modules/angular-ui-router/release/angular-ui-router.js',
            './node_modules/angular-mocks/angular-mocks.js',
            './node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
            './node_modules/angular-multi-step-form/dist/browser/angular-multi-step-form.js',
            './node_modules/split.js/dist/split.js',
            './node_modules/underscore/underscore.js',
            './node_modules/bootstrap/dist/js/bootstrap.js',
            './node_modules/bootstrap/js/affix.js',
            './node_modules/angular-xeditable/dist/js/xeditable.js',
            './node_modules/angular-sanitize/angular-sanitize.js',
            './node_modules/jquery-ui-dist/jquery-ui.js',

            './src/views/**/*.html', //add all controller templates and views for 'ng-html2js'
            './src/js/directives/**/*.html', //add all directive templates for 'ng-html2js'
            {pattern: 'tests/**/*.js',watched:true,served:true,included:true}
            /*parameters:
                watched: if autoWatch is true all files that have set watched to true will be watched for changes
                served: should the files be served by Karma's webserver?
                included: should the files be included in the browser using <script> tag?
                nocache: should the files be served from disk on each request by Karma's webserver? */
            /*assets:
                {pattern: '*.html', watched:true, served:true, included:false}
                {pattern: 'images/*', watched:false, served:true, included:false} */
        ],

        //executes the tests whenever one of watched files changes
        autoWatch: true,
        //if true, Karma will run tests and then exit browser
        singleRun:false,
        //if true, Karma fails on running empty test-suites
        failOnEmptyTestSuite:false,
        //reduce the kind of information passed to the bash
        logLevel: config.LOG_WARN, //config.LOG_DISABLE, config.LOG_ERROR, config.LOG_INFO, config.LOG_DEBUG

        //list of frameworks you want to use, only jasmine is installed automatically
        frameworks: ['jasmine'],
        //list of browsers to launch and capture
        browsers: ['Chrome',/*'PhantomJS','Firefox','Edge','ChromeCanary','Opera','IE','Safari'*/],
        //list of reporters to use
        reporters: ['mocha','kjhtml'/*,'dots','progress','spec', 'junit'*/],


        // the default configuration
        junitReporter: {
            outputDir: 'test_results', // results will be saved as $outputDir/$browserName.xml
            outputFile: undefined, // if included, results will be saved as $outputDir/$browserName/$outputFile
            suite: '', // suite will become the package name attribute in xml testsuite element
            useBrowserName: true, // add browser name to report and classes names
            nameFormatter: undefined, // function (browser, result) to customize the name attribute in xml testcase element
            classNameFormatter: undefined, // function (browser, result) to customize the classname attribute in xml testcase element
            properties: {}, // key value pair of properties to add to the <properties> section of the report
            xmlVersion: null // use '1' if reporting to be per SonarQube 6.2 XML format
        },

        //address that the server will listen on, '0.0.0.0' is default
        listenAddress: '0.0.0.0',
        //hostname to be used when capturing browsers, 'localhost' is default
        hostname: 'localhost',
        //the port where the web server will be listening, 9876 is default
        port: 9876,
        //when a browser crashes, karma will try to relaunch, 2 is default
        retryLimit:0,
        //how long does Karma wait for a browser to reconnect, 2000 is default
        browserDisconnectTimeout: 5000,
        //how long will Karma wait for a message from a browser before disconnecting from it, 10000 is default
        browserNoActivityTimeout: 10000,
        //timeout for capturing a browser, 60000 is default
        captureTimeout: 60000,

        client: {
            //capture all console output and pipe it to the terminal, true is default
            captureConsole:false,
            //if true, Karma clears the context window upon the completion of running the tests, true is default
            clearContext:false,
            //run the tests on the same window as the client, without using iframe or a new window, false is default
            runInParent: false,
            //true: runs the tests inside an iFrame; false: runs the tests in a new window, true is default
            useIframe:true,
            jasmine:{
                //tells jasmine to run specs in semi random order, false is default
                random: false
            }
        },

        /* karma-webpack config
           pass your webpack configuration for karma
           add `babel-loader` to the webpack configuration to make the ES6+ code readable to the browser */
        webpack: {
            devtool: 'eval',
            module: {
                rules: [
                    {
                        test: /\.js$/i,
                        exclude:/(node_modules)/,
                        loader:'babel-loader',
                        options:{
                            presets:['@babel/preset-env']
                        }
                    }
                ]
            }
        },

        //Remove prefix ('app/') from created templates by 'ng-html2js'
        ngHtml2JsPreprocessor: {

            // strip this from the file path
            // stripPrefix: 'src/views/directives/',
            // prependPrefix: './',

            cacheIdFromPath: function(filepath) {
                // var cacheId = filepath.replace('src/views/directives/', './');
                //var cacheId = filepath.replace('src/views/directives/', './');

                //OK What does the following mean?
                //It actually maps directive templates.
                //if we have a directive like src/js/directives/annotationList/annotationList.js
                //which has a template in it:
                // templateUrl: './annotationList.html'
                //which means the file is located at: src/js/directives/annotationList/annotationList.html
                //so when ngHtml2Js processes files in specified directories
                //if it finds a file starts with "src/js/directives/" it gets the file name
                //by filepath.split('/')[filepath.split('/').length - 1]
                //and then creates a module name like this './'+HTML_FILE_NAME.html
                //this helps us to keep the template file paths relative to the directive
                //so we easily have
                // src/js/directives/annotationList/annotationList.js
                // src/js/directives/annotationList/annotationList.html

                //if the files is not in "src/js/directives/" like controller templates
                //then it simply remove "src/" from the beginning
                if(filepath.startsWith("src/js/directives/")){
                    return "./" + filepath.split('/')[filepath.split('/').length - 1];
                }else{
                    return filepath.replace('src/', '');
                }
            },

        },
        // plugins : [
        //     "karma-jasmine-html-reporter",
        //     "karma-mocha-reporter",
        //     "karma-jasmine",
        //     "karma-webpack",
        //     "karma-ng-html2js-preprocessor"
        // ],
        preprocessors: {
            //add webpack as preprocessor to support require() in test-suits .js files
            './tests/**/*.js': ['webpack'],
            './src/views/**/*.html': ['ng-html2js'], //add all controller templates and views for 'ng-html2js'
            './src/js/directives/**/*.html': ['ng-html2js']//add all directive templates for 'ng-html2js'
        },

        webpackMiddleware: {
            //turn off webpack bash output when run the tests
            noInfo: true,
            stats: 'errors-only'
        },

        /*karma-mocha-reporter config*/
        mochaReporter: {
            output: 'noFailures'  //full, autowatch, minimal
        }
    });
};
