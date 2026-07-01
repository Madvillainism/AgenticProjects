let bridgeRef: any = null;

declare global {
  var QWebChannel: new (
    transport: any,
    callback: (channel: any) => void,
  ) => void;
}

export function getBridge(): any {
  return bridgeRef;
}

export function initBridge(): Promise<any> {
  return new Promise((resolve, reject) => {
    const transport = window.qt?.webChannelTransport;
    if (!transport) {
      reject(new Error("QWebChannel transport not available"));
      return;
    }
    if (typeof QWebChannel === "undefined") {
      reject(new Error("QWebChannel class not loaded"));
      return;
    }
    new QWebChannel(transport, (channel: any) => {
      bridgeRef = channel.objects.bridge;
      resolve(bridgeRef);
    });
  });
}
