class GameTimer {
  constructor(onTick, onFinish) {
    this.duration = 0;
    this.remainingTime = 0;
    this.intervalId = null;
    this.onTick = onTick;
    this.onFinish = onFinish; 
  }

  start(seconds) {
    this.duration = seconds;
    this.remainingTime = seconds;
    this.onTick(this.remainingTime);

    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.remainingTime--;
      this.onTick(this.remainingTime);

      if (this.remainingTime <= 0) {
        this.stop();
        this.onFinish();
      }
    }, 1000);
  }

  stop() {
    clearInterval(this.intervalId);
  }

  reduceTime(penaltySeconds = 5) {
    this.remainingTime -= penaltySeconds;
    if (this.remainingTime < 0) this.remainingTime = 0;
    this.onTick(this.remainingTime);

    if (this.remainingTime === 0) {
      this.stop();
      this.onFinish();
    }
  }
}