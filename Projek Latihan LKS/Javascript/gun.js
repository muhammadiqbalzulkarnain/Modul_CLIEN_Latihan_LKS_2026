class GunManager {
  constructor(gunImageElement, pointerElement) {
    this.gunImage = gunImageElement;
    this.pointer = pointerElement;
    this.gunList = ["assets/gun1.png", "assets/gun2.png"];
    this.currentIndex = 0;
  }

  setInitialGun(gunSrc) {
    this.currentIndex = this.gunList.indexOf("assets/" + gunSrc);
    if (this.currentIndex === -1) this.currentIndex = 0;
    this.gunImage.src = this.gunList[this.currentIndex];
  }

  updatePosition(x, y) {
    this.pointer.style.left = `${x}px`;
    this.pointer.style.top = `${y}px`;

    const offset = (x - 375) * 0.7;
    this.gunImage.style.transform = `translateX(calc(-50% + ${offset}px))`;
  }

  switchGun() {
    this.currentIndex = (this.currentIndex + 1) % this.gunList.length;
    this.gunImage.classList.add("gun-swap-anim");

    setTimeout(() => {
      this.gunImage.src = this.gunList[this.currentIndex];
    }, 150);

    setTimeout(() => {
      this.gunImage.classList.remove("gun-swap-anim");
    }, 300);
  }
}