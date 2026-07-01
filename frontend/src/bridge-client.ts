let bridgeRef: any = null;

// Declaramos QWebChannel como variable global porque Qt
// lo inyecta a través del script qrc:///qtwebchannel/qwebchannel.js
// (cargado en index.html).
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
      // Sin Qt: útil para testing en jsdom (navegador falso).
      reject(new Error("QWebChannel transport not available"));
      return;
    }
    if (typeof QWebChannel === "undefined") {
      // El script qwebchannel.js no se cargó.
      reject(new Error("QWebChannel class not loaded"));
      return;
    }
    // El QWebChannel nativo de Qt maneja todo el protocolo IPC:
    // enviar llamadas a métodos, recibir respuestas, escuchar señales.
    new QWebChannel(transport, (channel: any) => {
      // channel.objects contiene todos los objetos registrados
      // desde Python con channel.registerObject("bridge", ...).
      bridgeRef = channel.objects.bridge;
      resolve(bridgeRef);
    });
  });
}
