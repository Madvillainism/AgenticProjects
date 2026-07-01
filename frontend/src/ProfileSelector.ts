export class ProfileSelector {
  private overlay: HTMLDivElement;
  private callback: ((pet: "dog" | "cat", name: string) => void) | null = null;
  private selectedPet: "dog" | "cat" | null = null;
  private nameInput: HTMLInputElement;
  private startBtn: HTMLButtonElement;
  private petCards: Map<string, HTMLDivElement> = new Map();

  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "profile-selector";

    const title = document.createElement("p");
    title.className = "selector-title";
    title.textContent = "Elige tu compa\u00f1ero";
    this.overlay.appendChild(title);

    const options = document.createElement("div");
    options.className = "pet-options";
    const dogCard = this.createCard("dog", "Perro");
    const catCard = this.createCard("cat", "Gato");
    options.appendChild(dogCard);
    options.appendChild(catCard);
    this.overlay.appendChild(options);

    const nameLabel = document.createElement("label");
    nameLabel.className = "name-label";
    nameLabel.textContent = "Nombre:";
    this.overlay.appendChild(nameLabel);

    this.nameInput = document.createElement("input");
    this.nameInput.className = "name-input";
    this.nameInput.type = "text";
    this.nameInput.placeholder = "Tu mascota...";
    this.nameInput.addEventListener("input", () => this.updateStartBtn());
    this.overlay.appendChild(this.nameInput);

    this.startBtn = document.createElement("button");
    this.startBtn.className = "start-btn";
    this.startBtn.textContent = "Adoptar";
    this.startBtn.disabled = true;
    this.startBtn.addEventListener("click", () => {
      if (this.callback && this.selectedPet && this.nameInput.value.trim()) {
        this.callback(this.selectedPet, this.nameInput.value.trim());
      }
    });
    this.overlay.appendChild(this.startBtn);

    const app = document.getElementById("app");
    if (app) {
      app.appendChild(this.overlay);
    }
  }

  private createCard(pet: "dog" | "cat", label: string): HTMLDivElement {
    const card = document.createElement("div");
    card.className = "pet-card";

    const img = document.createElement("img");
    img.src = `sprites/${pet}-sprite-sheet-frame.png`;
    img.alt = label;

    const span = document.createElement("span");
    span.textContent = label;

    card.appendChild(img);
    card.appendChild(span);

    card.addEventListener("click", () => {
      this.selectedPet = pet;
      this.petCards.forEach((c, key) => {
        c.classList.toggle("selected", key === pet);
      });
      this.updateStartBtn();
    });

    this.petCards.set(pet, card);
    return card;
  }

  private updateStartBtn(): void {
    this.startBtn.disabled = !(this.selectedPet && this.nameInput.value.trim());
  }

  onSelect(callback: (pet: "dog" | "cat", name: string) => void): void {
    this.callback = callback;
  }

  destroy(): void {
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}
