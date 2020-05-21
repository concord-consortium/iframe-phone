iframe-phone
============
Simplified communication between the parent site and iframe based on [window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage)

## Build

To install dependencies (browserify) run:

    npm install

To build the library in *dist* directory run:

    npm run build


## Usage

iframe-phone is a UMD bundle (*dist/iframe-phone.js*). You can include it directly or use some module system (e.g. browserify or RequireJS). When you include it directly, it will be available under global `iframePhone` name.

### parent

```javascript
var phone = new iframePhone.ParentEndpoint(iframeElement, function () {
  console.log("connection with iframe established");
});
phone.post('testMessage', 'abc');
phone.addListener('response', function (content) {
  console.log("parent received response: " + content);
});
```

### iframe

```javascript
// IFrameEndpoint instance is a singleton (iframe can't have multiple parents anyway).
var phone = iframePhone.getIFrameEndpoint();
phone.addListener('testMessage', function (content) {
  console.log("iframe received message: " + content);
  phone.post('response', 'got it');
});
// Initialize connection after all message listeners are added!
phone.initialize();
```

## Changelog

#### 1.3.1
- Fixed issues with index.d.ts types file for latest TypeScript

#### 1.3.0

- Added index.d.ts types file so the library can be consumed by TypeScript
- Added removeListener() to IFrameEndpoint
- Added removeAllListeners() to ParentEndpoint
- Added call to removeAllListeners() in IFrameEndpoint and ParentEndpoint disconnect()

#### 1.2.1

- Fix structured clone test that resulted in no actual use of structured clone even
   when the browser supported it. This might speed up the message passing.
- Fix typo in disconnect which was preventing an real disconnect

#### 1.2.0

- Added support of `file://` protocol (both ParentEndpoint and IframeEndpoint need to be upgraded to >= v1.2.0)
- Origin check removed from IframeEndpoint (it didn't provide any security)


## Licensing

iframe-phone is Copyright 2012 (c) by the Concord Consortium and is distributed under [MIT](http://www.opensource.org/licenses/MIT) license.
