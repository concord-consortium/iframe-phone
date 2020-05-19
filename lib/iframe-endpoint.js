var structuredClone = require('./structured-clone');
var HELLO_INTERVAL_LENGTH = 200;
var HELLO_TIMEOUT_LENGTH = 60000;

function IFrameEndpoint() {
  var listeners = {};
  var isInitialized = false;
  var connected = false;
  var postMessageQueue = [];
  var helloInterval;

  function postToParent(message) {
    // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
    //     https://github.com/Modernizr/Modernizr/issues/388
    //     http://jsfiddle.net/ryanseddon/uZTgD/2/
    if (structuredClone.supported()) {
      window.parent.postMessage(message, '*');
    } else {
      window.parent.postMessage(JSON.stringify(message), '*');
    }
  }

  function post(type, content) {
    var message;
    // Message object can be constructed from 'type' and 'content' arguments or it can be passed
    // as the first argument.
    if (arguments.length === 1 && typeof type === 'object' && typeof type.type === 'string') {
      message = type;
    } else {
      message = {
        type: type,
        content: content
      };
    }
    if (connected) {
      postToParent(message);
    } else {
      postMessageQueue.push(message);
    }
  }

  function postHello() {
    postToParent({
      type: 'hello'
    });
  }

  function addListener(type, fn) {
    listeners[type] = fn;
  }

  function removeListener(type) {
    delete listeners[type];
  }

  function removeAllListeners() {
    listeners = {};
  }

  function getListenerNames() {
    return Object.keys(listeners);
  }

  function messageListener(message) {
    // Anyone can send us a message. Only pay attention to messages from parent.
    if (message.source !== window.parent) return;
    var messageData = message.data;
    if (typeof messageData === 'string') messageData = JSON.parse(messageData);

    if (!connected && messageData.type === 'hello') {
      connected = true;
      stopPostingHello();
      while (postMessageQueue.length > 0) {
        post(postMessageQueue.shift());
      }
    }

    if (connected && listeners[messageData.type]) {
      listeners[messageData.type](messageData.content);
    }
  }

  function disconnect() {
    connected = false;
    stopPostingHello();
    removeAllListeners();
    window.removeEventListener('message', messageListener);
  }

  /**
    Initialize communication with the parent frame. This should not be called until the app's custom
    listeners are registered (via our 'addListener' public method) because, once we open the
    communication, the parent window may send any messages it may have queued. Messages for which
    we don't have handlers will be silently ignored.
  */
  function initialize() {
    if (isInitialized) {
      return;
    }
    isInitialized = true;
    if (window.parent === window) return;

    // We kick off communication with the parent window by sending a "hello" message. Then we wait
    // for a handshake (another "hello" message) from the parent window.
    startPostingHello();
    window.addEventListener('message', messageListener, false);
  }

  function startPostingHello() {
    if (helloInterval) {
      stopPostingHello();
    }
    helloInterval = window.setInterval(postHello, HELLO_INTERVAL_LENGTH);
    window.setTimeout(stopPostingHello, HELLO_TIMEOUT_LENGTH);
    // Post the first msg immediately.
    postHello();
  }

  function stopPostingHello() {
    window.clearInterval(helloInterval);
    helloInterval = null;
  }

  // Public API.
  return {
    initialize: initialize,
    getListenerNames: getListenerNames,
    addListener: addListener,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    disconnect: disconnect,
    post: post
  };
}

var instance = null;

// IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
module.exports = function getIFrameEndpoint() {
  if (!instance) {
    instance = new IFrameEndpoint();
  }
  return instance;
};
