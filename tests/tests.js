/*global describe, it, beforeEach, afterEach, expect, jasmine, oneChildIframeLoaded, iframePhone */

"use strict";

var IframePhoneRpcEndpoint = iframePhone.IframePhoneRpcEndpoint;

// Situation: iframe-phone is loaded in our parent iframe, and in our 2 child iframes.

function areIframesLoaded() {
    return frames['child-1'] && frames['child-1'].loaded &&
                 frames['child-2'] && frames['child-2'].loaded;
}

// use this global to hold the "done" callback that tells Jasmine to continue
var callbackForPendingIframeLoad;

// called by child iframe
function oneChildIframeLoaded() {
    var callback;

    if (areIframesLoaded() && callbackForPendingIframeLoad) {
        callback = callbackForPendingIframeLoad;
        // make sure the pending-callback is null *before* we call it (since it probably invokes a
        // bunch of tests)
        callbackForPendingIframeLoad = null;
        callback();
    }
}

// Before running any test, make sure both child iframes are loaded.
// This requires Jasmine 2.0+ for the async beforeEach().
beforeEach(function(done) {
    if (areIframesLoaded()) {
        done();
    } else {
        callbackForPendingIframeLoad = done;
    }
});

// Just test to make sure we're correctly waiting for child iframes to load.
describe("iframes", function() {
    it("should be loaded", function() {
        expect(frames['child-1'].loaded).toBe(true);
        expect(frames['child-2'].loaded).toBe(true);
    });
});


describe("IframePhoneRpcEndpoint", function() {

    var parentEndpoint, child1Endpoint;

    function handler() {
        // can use this to test ability to respond to message from child
    }

    beforeEach(function() {
        if ( ! parentEndpoint ) {
            parentEndpoint = new IframePhoneRpcEndpoint(handler, "test-namespace", window.parent);
            child1Endpoint = new IframePhoneRpcEndpoint(handler, "test-namespace", frames['child-1'], location.origin);

            // we need to ensure we're listening before child starts up...
            frames['child-1'].initPhone();
        }
    });

    describe("invocation of remote-endpoint method", function() {

        it("should work if the remote endpoint is in a parent window", function(done) {
            parentEndpoint.call("hello", function(message) {
                expect(message).toEqual("hello to you from your parent!");
                done();
            });
        });

        it("should work if the remote endpoint is in a child window", function(done) {
            child1Endpoint.call("hello", function(message) {
                expect(message).toEqual("hello to you from your child!");
                done();
            });
        });

       it("should respond appropriately to its argument", function(done) {
            child1Endpoint.call({ echo: "pingpong" }, function(message) {
                expect(message).toEqual("pingpong");
                done();
            });
        });

        describe("after a second child iframe is initialized", function() {

            var child2Endpoint;

            beforeEach(function() {
                if ( ! child2Endpoint ) {
                    child2Endpoint = new IframePhoneRpcEndpoint(handler, "test-namespace", frames['child-2'], location.origin);
                    frames['child-2'].initPhone();
                }
            });

            it("should associate the correct endpoint with the correct message", function(done) {
                child1Endpoint.call("hash", function(message) {
                    expect(message).toEqual("#1");
                    child2Endpoint.call("hash", function(message) {
                        expect(message).toEqual("#2");
                        done();
                    });
                });
            });
        });

        it("should not require defining a callback if the return value is not important", function(done) {

            var caughtError = false;
            function handler() {
                caughtError = true;
            }
            window.addEventListener('error', handler);

            child1Endpoint.call("hello");
            child1Endpoint.call("hello", function() {
                expect(caughtError).toBe(false);
                window.removeEventListener('error', handler);
                done();
            });
        });
    });


    describe("matching of callbacks to apiCall messages", function() {

        it("should work when the replies are returned in the same order as calls", function(done) {
            var replies = [];
            var nCallbacks = 0;

            function finish() {
                expect(replies).toEqual(["delayed response", "response after delayed response"]);
                done();
            }

            child1Endpoint.call("respondAfterDelay", function(message) {
                replies.push(message);
                if (++nCallbacks === 2) finish();
            });

            child1Endpoint.call("respondAfterDelayedResponse", function(message) {
                replies.push(message);
                if (++nCallbacks === 2) finish();
            });
        });

        it("should work when the replies are returned in reverse order of calls", function(done) {
            var replies = [];
            var nCallbacks = 0;

            function finish() {
                expect(replies).toEqual(["response before delayed response", "delayed response"]);
                done();
            }

            child1Endpoint.call("respondAfterDelay", function(message) {
                replies.push(message);
                if (++nCallbacks === 2) finish();
            });

            child1Endpoint.call("respondBeforeDelayedResponse", function(message) {
                replies.push(message);
                if (++nCallbacks === 2) finish();
            });
        });
    });


  describe("call timeout", function() {

    beforeEach(function() {
        jasmine.clock().install();
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    it("should return an error if reply message takes a long time", function() {
        var callback = jasmine.createSpy('callback');

        child1Endpoint.call("neverRespond", callback);

        jasmine.clock().tick(999);

        expect(callback).not.toHaveBeenCalled();

        jasmine.clock().tick(4000);

        expect(callback).toHaveBeenCalled();
        expect(callback.calls.first().args[0]).toBeUndefined();
        expect(callback.calls.first().args[1].constructor).toBe(Error);
    });

    it("should not time out after a successful reply", function(done) {
        var isFirstCallback = true;

        child1Endpoint.call("hello", function(message, error) {
            expect(error).toBeUndefined();

            if (isFirstCallback) {
                isFirstCallback = false;
                // a second call to this callback would occur here if we don't clear the timeout:
                jasmine.clock().tick(1e6);
                done();
            }
        });
    });

    it("should not throw an error if the timeout occurs and there is no callback", function() {
        child1Endpoint.call("neverRespond");
        expect(function() { jasmine.clock().tick(4000); }).not.toThrow();
    });

  });
});
