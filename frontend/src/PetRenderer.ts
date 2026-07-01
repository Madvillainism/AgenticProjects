export type PetState = "idle" | "walking" | "sleeping" | "alerting";

export class PetRenderer {
  private el: HTMLDivElement;
  private pet: "dog" | "cat";
  private currentState: PetState = "idle";

  constructor(pet: "dog" | "cat") {
    this.pet = pet;
    this.el = document.createElement("div");
    this.el.className = `sprite ${pet}-idle`;
    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.el);
    }
  }

  setState(state: PetState): void {
    this.currentState = state;
    this.el.className = `sprite ${this.pet}-${state}`;
  }

  getState(): PetState {
    return this.currentState;
  }

  setPetType(pet: "dog" | "cat"): void {
    this.pet = pet;
    this.setState(this.currentState);
  }

  getImageElement(): HTMLElement {
    return this.el;
  }
}
