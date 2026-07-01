let bridgeRef: any = null;

export class QWebChannel {
  private transport: { send: (msg: string) => void; onmessage: ((event: { data: string }) => void) | null };
  private initCallback: ((channel: QWebChannel) => void) | null;
  private execCallbacks: Map<number, (data: any) => void> = new Map();
  private nextId: number = 1;
  objects: Record<string, any> = {};

  constructor(transport: any, initCallback: (channel: QWebChannel) => void) {
    this.transport = transport;
    this.initCallback = initCallback;
    this.transport.onmessage = (event: { data: string }) => {
      try {
        this.exec(JSON.parse(event.data));
      } catch (e) {
        console.error("QWebChannel message error", e);
      }
    };
    this.transport.send(JSON.stringify({ id: 0, type: "init" }));
  }

  private exec(msg: any): void {
    switch (msg.type) {
      case "init":
        if (msg.data) {
          for (const name in msg.data) {
            this.registerObject(name, msg.data[name]);
          }
        }
        if (this.initCallback) {
          this.initCallback(this);
          this.initCallback = null;
        }
        break;
      case "signal":
        {
          const obj = this.objects[msg.object];
          if (obj && obj._signalCallbacks && obj._signalCallbacks[msg.signal]) {
            for (const cb of obj._signalCallbacks[msg.signal]) {
              cb(...(msg.args || []));
            }
          }
        }
        break;
      case "propertyUpdate":
        if (msg.data) {
          for (const objName in msg.data) {
            const obj = this.objects[objName];
            if (obj && obj._propertyValues) {
              for (const propName in msg.data[objName]) {
                obj._propertyValues[propName] = msg.data[objName][propName];
              }
            }
          }
        }
        break;
      case "response":
        {
          const cb = this.execCallbacks.get(msg.id);
          if (cb) {
            cb(msg.data);
            this.execCallbacks.delete(msg.id);
          }
        }
        break;
    }
  }

  private registerObject(name: string, objData: any): void {
    const propertyValues: Record<string, any> = {};
    const signalCallbacks: Record<string, Array<(...args: any[]) => void>> = {};

    for (const signalName of (objData.signals || [])) {
      signalCallbacks[signalName] = [];
    }

    const obj: Record<string, any> = {};

    for (const propName in (objData.properties || {})) {
      propertyValues[propName] = objData.properties[propName];
      Object.defineProperty(obj, propName, {
        get: () => propertyValues[propName],
        set: (value: any) => {
          propertyValues[propName] = value;
        },
        enumerable: true,
        configurable: true,
      });
    }

    for (const methodName of (objData.methods || [])) {
      obj[methodName] = (...args: any[]) => {
        const id = this.nextId++;
        return new Promise<any>((resolve) => {
          this.execCallbacks.set(id, resolve);
          this.transport.send(JSON.stringify({
            id,
            type: "call",
            object: name,
            method: methodName,
            args,
          }));
        });
      };
    }

    obj.connect = (signalName: string, callback: (...args: any[]) => void) => {
      if (!signalCallbacks[signalName]) {
        signalCallbacks[signalName] = [];
      }
      signalCallbacks[signalName].push(callback);
    };

    obj.disconnect = (signalName: string, callback: (...args: any[]) => void) => {
      if (signalCallbacks[signalName]) {
        const idx = signalCallbacks[signalName].indexOf(callback);
        if (idx >= 0) {
          signalCallbacks[signalName].splice(idx, 1);
        }
      }
    };

    obj._propertyValues = propertyValues;
    obj._signalCallbacks = signalCallbacks;

    this.objects[name] = obj;
  }
}

export function getBridge(): any {
  return bridgeRef;
}

export function initBridge(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!window.qt?.webChannelTransport) {
      reject(new Error("QWebChannel transport not available"));
      return;
    }
    new QWebChannel(window.qt.webChannelTransport, (channel: QWebChannel) => {
      bridgeRef = channel.objects.bridge;
      resolve(bridgeRef);
    });
  });
}
