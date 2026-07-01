export class SpeechBubble {
  private element: HTMLDivElement | null = null;
  private onDismiss: (() => void) | null = null;

  show(text: string, actions: Array<{ label: string; action: string }>, onDismiss?: () => void): void {
    if (this.element) {
      return;
    }

    this.onDismiss = onDismiss || null;

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

    this.element.classList.add("hiding");

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
