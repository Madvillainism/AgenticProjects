// Renders a floating bubble with message text and action buttons
export class SpeechBubble {
  private bridge: any;
  private element: HTMLDivElement | null = null;

  // Store the bridge reference for action callbacks
  constructor(bridge: any) {
    this.bridge = bridge;
  }

  // Create and display the speech bubble element with text and actions
  show(text: string, actions: Array<{ label: string; action: string }>): void {
    if (this.element) {
      return;
    }

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
          if (action.action === "water" && this.bridge) {
            this.bridge.logWater();
          }
          if (action.action === "dismiss" && this.bridge) {
            this.bridge.dismissBubble();
          }
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

  // Remove the speech bubble from the DOM
  hide(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }

  // Return whether the bubble is currently displayed
  isVisible(): boolean {
    return this.element !== null;
  }
}
