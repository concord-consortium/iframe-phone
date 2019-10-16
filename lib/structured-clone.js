var featureSupported = false;

(function () {
  var result = 0;

  if (!!window.postMessage) {
    try {
      var handler = function(e){
        // We should not get here at all. Attempting to send a DOM node over
        // PostMessage should fail whether Structured Clones are supported or
        // not. In case we do, however, we can at least remove ourselves.
        window.removeEventListener('message', handler);
      };
      window.addEventListener('message', handler);
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implementations that support cloned data will throw.
      window.postMessage(document.createElement("a"), "*");
    } catch (e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
      window.removeEventListener('message', handler);
      result = (e.DATA_CLONE_ERR || e.message === "Cannot post cyclic structures.") ? 1 : 0;
      featureSupported = {
        'structuredClones': result
      };
    }
  }
}());

exports.supported = function supported() {
  return featureSupported && featureSupported.structuredClones > 0;
};
