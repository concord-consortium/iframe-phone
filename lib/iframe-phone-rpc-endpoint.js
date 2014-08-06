var ParentEndpoint = require('./parent-endpoint');
var getIFrameEndpoint = require('./iframe-endpoint');

// Not a real UUID as there's an RFC for that (needed for proper distributed computing).
// But in this fairly parochial situation, we just need to be fairly sure to avoid repeats.
function getPseudoUUID() {
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var len = chars.length;
    var ret = [];

    for (var i = 0; i < 10; i++) {
        ret.push(chars[Math.floor(Math.random() * len)]);
    }
    return ret.join('');
}

module.exports = function IframePhoneRpcEndpoint(handler, namespace, targetWindow, targetOrigin) {
    var phone;
    var pendingCallbacks = Object.create({});

    if (targetWindow === window.parent) {
        phone = getIFrameEndpoint();
        phone.initialize();
    } else {
        phone = new ParentEndpoint(targetWindow, targetOrigin);
    }

    phone.addListener(namespace, function(message) {
        var callback;

        if (message.messageType === 'call') {
            handler(message.value, function(returnValue) {
                phone.post(namespace, {
                    messageType: 'returnValue',
                    uuid: message.uuid,
                    value: returnValue
                });
            });
        } else if (message.messageType === 'returnValue') {
            callback = pendingCallbacks[message.uuid];
            if (callback) {
                callback(message.value);
                pendingCallbacks[message.uuid] = null;
            }
        }
    });

    function call(message, callback) {
        var uuid = getPseudoUUID();
        pendingCallbacks[uuid] = callback;

        phone.post(namespace, {
            messageType: 'call',
            uuid: uuid,
            value: message
        });
    }

    function disconnect() {
        phone.disconnect();
    }

    return {
        call: call,
        disconnect: disconnect
    };
};
