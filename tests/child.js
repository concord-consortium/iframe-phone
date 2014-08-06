/*global iframePhone */

var IframePhoneRpcEndpoint = iframePhone.IframePhoneRpcEndpoint;

function initPhone() {

    var delayedCallback;

    function handler(message, callback) {

        if (message && message.echo) {
            callback(message.echo);
            return;
        }

        switch (message) {
            case "hello":
                callback("hello to you from your child!");
            return;
            case "pathname":
                callback(document.location.pathname);
            return;
            case "hash":
                callback(document.location.hash);
            return;
            case "respondAfterDelay":
                delayedCallback = function() {
                    callback("delayed response");
                };
            return;
            case "respondAfterDelayedResponse":
                delayedCallback();
                callback("response after delayed response");
            return;
            case "respondBeforeDelayedResponse":
                callback("response before delayed response");
                delayedCallback();
            return;
            case "neverRespond":
            return;
        }

        callback("Error: didn't understand that message.");
    }

    new IframePhoneRpcEndpoint(handler, 'test-namespace', window.parent, location.origin);
}
