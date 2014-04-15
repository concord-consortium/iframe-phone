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

## Licensing

iframe-phone is Copyright 2012 (c) by the Concord Consortium and is distributed under
any of the following licenses:

- [Simplified BSD](http://www.opensource.org/licenses/BSD-2-Clause),
- [MIT](http://www.opensource.org/licenses/MIT), or
- [Apache 2.0](http://www.opensource.org/licenses/Apache-2.0).
