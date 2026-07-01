export class SpeechBubble {
  private element: HTMLDivElement | null = null;
  private onDismiss: (() => void) | null = null;

  show(text: string, actions: Array<{ label: string; action: string }>, onDismiss?: () => void): void {
    // No crear burbuja duplicada si ya hay una visible.
    if (this.element) {
      return;
    }

    this.onDismiss = onDismiss || null;

    // La burbuja es un div con clase .speech-bubble.
    // La animación de entrada (bubble-in) se dispara sola
    // con CSS al aparecer en el DOM.
    this.element = document.createElement("div");
    this.element.className = "speech-bubble";

    const textEl = document.createElement("p");
    textEl.textContent = text;
    this.element.appendChild(textEl);

    if (actions.length > 0) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      for (const action of actions) {
        const btn = document.createElement("button");
        btn.textContent = action.label;
        // Todos los botones solo ocultan la burbuja.
        // No hay IPC ni tracking de salud.
        btn.addEventListener("click", () => {
          this.hide();
        });
        actionsDiv.appendChild(btn);
      }

      this.element.appendChild(actionsDiv);
    }

    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.element);
    }
  }

  hide(): void {
    if (!this.element) return;

    // En lugar de remover instantáneo, agregamos clase
    // "hiding" que dispara la animación CSS bubble-out.
    this.element.classList.add("hiding");

    // Escuchamos animationend para remover el nodo
    // exactamente cuando la animación termina.
    // { once: true } evita memory leaks.
    this.element.addEventListener("animationend", () => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.element = null;
      if (this.onDismiss) {
        this.onDismiss();
        this.onDismiss = null;
      }
    }, { once: true });
  }

  isVisible(): boolean {
    return this.element !== null;
  }
}
