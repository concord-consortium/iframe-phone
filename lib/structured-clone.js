var featureSupported = {
  'structuredClones': 0
};

(function () {
  var result = 0;

  if (!!window.postMessage) {
    try {
      // Spec states you can't transmit DOM nodes and it will throw an error
      // postMessage implementations that support cloned data will throw.
      window.postMessage(document.createElement("a"), "*");
    } catch (e) {
      // BBOS6 throws but doesn't pass through the correct exception
      // so check error message
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
