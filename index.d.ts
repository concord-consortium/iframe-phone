export type AfterConnectedCallback = () => void;

export type ListenerCallback = (value: any) => void;

export class ParentEndpoint {
  constructor(targetWindowOrIframeEl: WindowProxy | HTMLIFrameElement, afterConnectedCallback?: AfterConnectedCallback);
  constructor(targetWindowOrIframeEl: WindowProxy | HTMLIFrameElement, targetOrigin?: string, afterConnectedCallback?: AfterConnectedCallback);
  post(type: string, content?: object | string | number | null): void;
  post(type: {type: string; content?: object | string | number | null}): void;
  addListener(messageName: string, callback: ListenerCallback): void;
  removeListener(messageName: string): void;
  removeAllListeners(): void;
  disconnect(): void;
  getTargetWindow(): WindowProxy;
  targetOrigin: targetOrigin
}

export class IFrameEndpoint {
  initialize(): void;
  getListenerNames(): string[];
  post(type: string, content?: object | string | number | null): void;
  post(type: {type: string; content?: object | string | number | null}): void;
  addListener(type: string, ListenerCallback): void;
  removeListener(messageName: string): void;
  removeAllListeners(): void;
  disconnect(): void;
}

export type IframePhoneRpcEndpointHandlerFn = (value: any, callback: (returnValue: any) => void) => void;

export interface IframePhoneRpcEndpointHandlerObj {
  namespace: string;
  phone: ParentEndpoint | IFrameEndpoint;
  targetWindow?: WindowProxy | HTMLIFrameElement;
  targetOrigin?: string;
}

export class IframePhoneRpcEndpoint {
  constructor(handler: IframePhoneRpcEndpointHandlerObj);
  constructor(handler: IframePhoneRpcEndpointHandlerFn, namespace: string, targetWindow: WindowProxy | HTMLIFrameElement, targetOrigin: string, phone: ParentEndpoint | IFrameEndpoint);
  handler: IframePhoneRpcEndpointHandlerFn;
  call(message: string, callback: ListenerCallback): void;
  disconnect(): void;
}

export function getIFrameEndpoint(): IFrameEndpoint

export const structuredClone = {
  supported(): boolean;
}
