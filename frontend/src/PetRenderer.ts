export type PetState = "idle" | "walking" | "sleeping";

export class PetRenderer {
  private el: HTMLDivElement;
  private nameEl: HTMLDivElement;
  private pet: "dog" | "cat";
  private currentState: PetState = "idle";

  constructor(pet: "dog" | "cat") {
    this.pet = pet;
    this.el = document.createElement("div");
    this.el.className = `sprite ${pet}-idle`;

    this.nameEl = document.createElement("div");
    this.nameEl.className = "pet-name";

    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.nameEl);
      app.appendChild(this.el);
    }
  }

  setName(name: string): void {
    this.nameEl.textContent = name;
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
