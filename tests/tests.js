/*global describe, it, beforeEach, expect, oneChildIframeLoaded, iframePhone */

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


describe("iframePhoneRpc endpoints", function() {

    describe("invocation of remote-endpoint method", function() {

      var parentEndpoint, childEndpoint;
      var receivedMessage;


      function handler() {
        // can use this to test ability to respond to message from child
      };

      beforeEach(function() {
        if ( ! parentEndpoint ) {
          // Note that this is silly; we should require a contentWindow, not a frame
          parentEndpoint = new IframePhoneRpcEndpoint(handler, "test-namespace", window.parent);
          childEndpoint = new IframePhoneRpcEndpoint(handler, "test-namespace", frames['child-1'], location.origin);

          // we need to ensure we're listening before child starts up...
          frames['child-1'].initPhone();
          frames['child-2'].initPhone();
        }

      });

      it("should work if the remote endpoint is in a parent window", function(done) {
        parentEndpoint.call({ hello: true }, function(message) {
          expect(message).toEqual({ receivedHello: true });
          done();
        });
      });

      it("should work if the remote endpoint is in a child window", function(done) {
        childEndpoint.call({ hello: true }, function(message) {
          expect(message).toEqual({ receivedHello: true });
          done();
        });
      });

    });

    describe("after a second child iframe is initialized", function() {

      xit("should correctly reply to messages from the second iframe without additional initialization", function() {
      });

      xit("should correctly reply to messages from either iframe", function() {
      });

    });

    describe("matching of callbacks to apiCall messages", function() {

      xit("should work when the replies are returned in the same order as the originating apiCall messages", function() {

      });

      xit("should work when the replies are returned in the same order as the originating apiCall messages", function() {
      });

  });
});
