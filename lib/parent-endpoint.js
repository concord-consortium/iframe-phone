var structuredClone = require('./structured-clone');

module.exports = function ParentEndpoint(iframe, afterConnectedCallback) {
  var selfOrigin = window.location.href.match(/(.*?\/\/.*?)\//)[1];
  var postMessageQueue = [];
  var connected = false;
  var handlers = {};

  function getIframeOrigin() {
    return iframe.src.match(/(.*?\/\/.*?)\//)[1];
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
      // if we are laready connected ... send the message
      message.origin = selfOrigin;
      // See http://dev.opera.com/articles/view/window-postmessage-messagechannel/#crossdoc
      //     https://github.com/Modernizr/Modernizr/issues/388
      //     http://jsfiddle.net/ryanseddon/uZTgD/2/
      if (structuredClone.supported()) {
        iframe.contentWindow.postMessage(message, getIframeOrigin());
      } else {
        iframe.contentWindow.postMessage(JSON.stringify(message), getIframeOrigin());
      }
    } else {
      // else queue up the messages to send after connection complete.
      postMessageQueue.push(message);
    }
  }

  function addListener(messageName, func) {
    handlers[messageName] = func;
  }

  function removeListener(messageName) {
    handlers[messageName] = null;
  }

  function receiveMessage(message) {
    var messageData;

    if (message.source === iframe.contentWindow && message.origin === getIframeOrigin()) {
      messageData = message.data;
      if (typeof messageData === 'string') {
        messageData = JSON.parse(messageData);
      }
      if (handlers[messageData.type]) {
        handlers[messageData.type](messageData.content);
      } else {
        console.log("cant handle type: " + messageData.type);
      }
    }
  }

  // when we receive 'hello':
  addListener('hello', function() {
    connected = true;

    // send hello response
    post('hello');

    // give the user a chance to do things now that we are connected
    // note that is will happen before any queued messages
    if (afterConnectedCallback && typeof afterConnectedCallback === "function") {
      afterConnectedCallback();
    }

    // Now send any messages that have been queued up ...
    while(postMessageQueue.length > 0) {
      post(postMessageQueue.shift());
    }
  });

  window.addEventListener('message', receiveMessage, false);

  // Public API.
  return {
    post: post,
    addListener: addListener,
    removeListener: removeListener
  };
};
