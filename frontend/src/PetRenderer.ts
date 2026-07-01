export type PetState = "idle" | "walking" | "sleeping" | "alerting";

// Frames per state for dog and cat spritesheets
const FRAMES: Record<string, Record<PetState, number>> = {
  dog: { idle: 8, walking: 11, sleeping: 4, alerting: 8 },
  cat: { idle: 8, walking: 12, sleeping: 4, alerting: 8 },
};

// Manages the DOM sprite element and its animation state
export class PetRenderer {
  private el: HTMLDivElement;
  private pet: "dog" | "cat";
  private currentState: PetState = "idle";

  // Create the sprite div and append it to the app container
  constructor(pet: "dog" | "cat") {
    this.pet = pet;
    this.el = document.createElement("div");
    this.el.className = `sprite ${pet}-idle`;
    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.el);
    }
  }

  // Update the sprite's CSS class and frame count for the new state
  setState(state: PetState): void {
    this.currentState = state;
    this.el.style.setProperty("--frames", String(FRAMES[this.pet][state]));
    this.el.className = `sprite ${this.pet}-${state}`;
  }

  getState(): PetState {
    return this.currentState;
  }

  // Swap the spritesheet (dog/cat) without changing current state
  setPetType(pet: "dog" | "cat"): void {
    this.pet = pet;
    this.setState(this.currentState);
  }

  getImageElement(): HTMLElement {
    return this.el;
  }
}
