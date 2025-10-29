const iframePhone = {
  /**
   * Allows communication with an iframe.
   */
  ParentEndpoint:  require('./lib/parent-endpoint'),
  /**
   * Allows communication with a parent page.
   * IFrameEndpoint is a singleton, as iframe can't have multiple parents anyway.
   */
  getIFrameEndpoint: require('./lib/iframe-endpoint'),
  structuredClone: require('./lib/structured-clone'),

  IframePhoneRpcEndpoint: require('./lib/iframe-phone-rpc-endpoint')

};

module.exports = iframePhone;
