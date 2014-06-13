/*global iframePhone */

var IframePhoneRpcEndpoint = iframePhone.IframePhoneRpcEndpoint;

window.onload = function() {
	function handler(message, callback) {
		if (message && message.hello && message.hello === true) {
			callback({
				receivedHello: true
			});
		}
	}

	new IframePhoneRpcEndpoint(handler, 'test-namespace', frames['tests-iframe'], location.origin);
};
