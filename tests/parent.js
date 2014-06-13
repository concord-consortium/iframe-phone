/*global iframePhone */

var IframePhoneRpcEndpoint = iframePhone.IframePhoneRpcEndpoint;

window.onload = function() {
	function handler(message, callback) {
		if (message === "hello") {
			callback("hello to you from your parent!");
		}
	}

	new IframePhoneRpcEndpoint(handler, 'test-namespace', frames['tests-iframe'], location.origin);
};
