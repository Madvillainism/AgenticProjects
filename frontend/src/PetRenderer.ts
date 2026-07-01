// Los tres estados posibles del sprite.
// Cada estado tiene su propia animación CSS.
export type PetState = "idle" | "walking" | "sleeping";

export class PetRenderer {
  private el: HTMLDivElement;
  private nameEl: HTMLDivElement;
  private pet: "dog" | "cat";
  private currentState: PetState = "idle";

  constructor(pet: "dog" | "cat") {
    this.pet = pet;

    // Div del sprite. La clase CSS define qué imagen de fondo
    // mostrar y qué animación de frames usar.
    this.el = document.createElement("div");
    this.el.className = `sprite ${pet}-idle`;

    // Div del nombre (snackbar arriba del sprite).
    // Se posiciona con CSS: fixed, top calc(50% - 30px).
    this.nameEl = document.createElement("div");
    this.nameEl.className = "pet-name";

    const app = document.getElementById("app");
    if (app) {
      // El nombre va primero para que quede detrás del sprite
      // en el orden Z (aunque el CSS usa z-index).
      app.appendChild(this.nameEl);
      app.appendChild(this.el);
    }
  }

  setName(name: string): void {
    // Muestra el nombre de la mascota elegido por el usuario.
    this.nameEl.textContent = name;
  }

  setState(state: PetState): void {
    // Cambia la clase CSS → cambia sprite sheet y animación.
    // Ej: "sprite dog-idle" → "sprite dog-walking"
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
