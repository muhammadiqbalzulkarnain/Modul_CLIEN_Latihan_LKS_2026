class Player {
  constructor() {
    this.name = "";
    this.score = 0;
  }

  setName(name) {
    this.name = name;
    this.score = 0;
  }

  addScore(points = 10) {
    this.score += points;
  }
}