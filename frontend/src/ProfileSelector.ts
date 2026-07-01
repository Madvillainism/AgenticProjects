export class ProfileSelector {
  private overlay: HTMLDivElement;
  private callback: ((pet: "dog" | "cat") => void) | null = null;

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "profile-selector";

    const dogCard = this.createCard("dog", "Perro");
    const catCard = this.createCard("cat", "Gato");

    this.overlay.appendChild(dogCard);
    this.overlay.appendChild(catCard);

    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.overlay);
    }
  }

  private createCard(pet: "dog" | "cat", label: string): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "pet-card";

    const img = document.createElement("img");
    img.src = `/sprites/${pet}-sprite-sheet-frame.png`;
    img.alt = label;

    const span = document.createElement("span");
    span.textContent = label;

    card.appendChild(img);
    card.appendChild(span);

    card.addEventListener("click", () => {
      if (this.callback) {
        this.callback(pet);
      }
    });

    return card;
  }

  onSelect(callback: (pet: "dog" | "cat") => void): void {
    this.callback = callback;
  }

  destroy(): void {
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
