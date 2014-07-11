Statsd For Chrome
=================

### Installation:

1. Download and install [Google Chrome][https://www.google.com/intl/en/chrome/browser/]
2. Open the drop down menu at the top right, and navigate to and select "Settings"
3. Select "Extensions" from the left menu bar, and check "Developer mode" on the top right
4. Select "Load unpacked extension..." and select /statsd/chrome/
5. Select "Launch" and you should now have a statsd instance running in your browser!

### What this repo does:

* Allows statsd to run in a chrome packaged app (the same type you would download from the chrome app store)
* Uses pure chrome APIs, so node.js is never needed
* Runs in chrome, so it's still using the V8 JavaScript engine, so performance is still great
* Makes statsd very easily portable, since all it relies on is chrome

### How it does it:

* While lots of code changes were necessary to make this work, this merge only includes them in source/ and bundle.js, so as not to pollute the main repo
* Uses [browserify][https://github.com/substack/node-browserify] to handle the conversion, with [chrome-net][https://github.com/feross/chrome-net] and [chrome-dgram][https://github.com/feross/chrome-dgram] handling the wrapping of chrome's networking APIs

### Why it does it:

* This project was done to assist [Ripple Labs][https://www.ripple.com/] in easy tracking and monitoring of data, but the code created is fully general.

### Caveats:

* While the bundled chrome app can be run out of the box as is without any additional installations, browserify is required for compiling a new version, if that is ever needed
* Config editing has to be done inside bundle.js (or config.js if you are planning on re-bundling)--this is unfortunate, but no obvious workaround presented itself

*For more information, including all the code that went into this, see:
[][https://github.com/evhub/statsd]*