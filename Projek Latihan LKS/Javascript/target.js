class TargetManager {
  constructor(playAreaElement) {
    this.playArea = playAreaElement;
    this.selectedTargetImg = "assets/target1.png";
    this.spawnInterval = null;
  }

  setTargetImage(imageSrc) {
    this.selectedTargetImg = "assets/" + imageSrc;
  }

  spawnSingleTarget(onClickCallback) {
    const target = document.createElement("img");
    target.src = this.selectedTargetImg;
    target.className = "target-item";

    const maxX = 750 - 90;
    const maxY = 600 - 150;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * (maxY - 60)) + 50;

    target.style.left = `${randomX}px`;
    target.style.top = `${randomY}px`;

    target.addEventListener("click", (e) => {
      e.stopPropagation();
      target.remove();
      onClickCallback(true);

    const boom = document.createElement("img");
    boom.src = "assets/boom.png";
    boom.className = "boom-effect";
    boom.style.left = target.style.left;
    boom.style.top = target.style.top;

    this.playArea.appendChild(boom);

    target.remove();

    setTimeout(() => {
      boom.remove();
    }, 300);

    onClickCallback(true);
    });

    this.playArea.appendChild(target);
  }

  startSpawning(onClickCallback) {
    this.clearAll();
    for (let i = 0; i < 3; i++) {
      this.spawnSingleTarget(onClickCallback);
    }

    this.spawnInterval = setInterval(() => {
      this.spawnSingleTarget(onClickCallback);
    }, 3000);
  }

  stopSpawning() {
    clearInterval(this.spawnInterval);
  }

  clearAll() {
    const targets = this.playArea.querySelectorAll(".target-item");
    targets.forEach((t) => t.remove());
  }
}
