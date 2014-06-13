/*global iframePhone */

var IframePhoneRpcEndpoint = iframePhone.IframePhoneRpcEndpoint;

function initPhone() {
	function handler(message, callback) {
		console.log('received message');
		if (message && message.hello && message.hello === true) {
			callback({
				receivedHello: true
			});
		}
	}

	new IframePhoneRpcEndpoint(handler, 'test-namespace', window.parent, location.origin);
};
