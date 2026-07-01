export type PetState = "idle" | "walking" | "sleeping" | "alerting";

export class PetRenderer {
  private img: HTMLImageElement;
  private currentState: PetState = "idle";

  constructor(pet: "dog" | "cat") {
    this.img = document.createElement("img");
    this.img.src = `/sprites/${pet}-sprite-sheet-frame.png`;
    this.img.className = "sprite idle";
    this.img.draggable = false;
    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.img);
    }
  }

  setState(state: PetState): void {
    this.currentState = state;
    this.img.className = `sprite ${state}`;
  }

  getState(): PetState {
    return this.currentState;
  }

  setPetType(pet: "dog" | "cat"): void {
    this.img.src = `/sprites/${pet}-sprite-sheet-frame.png`;
  }

  getImageElement(): HTMLImageElement {
    return this.img;
  }
}
