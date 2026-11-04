class Game {
  constructor() {
    // Inisialisasi Objek pendukung
    this.player = new Player();
    this.timer = new GameTimer(
      (sec) => this.updateTimerDisplay(sec),
      () => this.onGameOver()
    );

    // Element DOM utama
    this.playArea = document.getElementById("play-area");
    this.gunImage = document.getElementById("gun-image");
    this.crosshair = document.getElementById("crosshair");

    this.targetManager = new TargetManager(this.playArea);
    this.gunManager = new GunManager(this.gunImage, this.crosshair);

    this.isPaused = false;
    this.isPlaying = false;

    this.initEvents();
    this.renderLeaderboard();
  }

  // Mendaftarkan seluruh Event Listener DOM
  initEvents() {
    const usernameInput = document.getElementById("username");
    const playBtn = document.getElementById("btn-play");

    // Validasi input username (tombol ter-disabled jika kosong)
    usernameInput.addEventListener("input", (e) => {
      playBtn.disabled = e.target.value.trim() === "";
    });

    // Tombol Instruksi
    document.getElementById("btn-instruction").addEventListener("click", () => {
      document.getElementById("instruction-modal").classList.remove("hidden");
    });
    document.getElementById("btn-close-instruction").addEventListener("click", () => {
      document.getElementById("instruction-modal").classList.add("hidden");
    });

    // Tombol Mulai Game
    playBtn.addEventListener("click", () => this.startCountdownAndPlay());

    // Gerakan Mouse pada Play Area
    this.playArea.addEventListener("mousemove", (e) => {
      if (!this.isPlaying || this.isPaused) return;
      const rect = this.playArea.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.gunManager.updatePosition(x, y);
    });

    // Klik Meleset (Tembakan tidak kena target)
    this.playArea.addEventListener("click", () => {
      if (!this.isPlaying || this.isPaused) return;
      // Pengurangan waktu 5 detik
      this.timer.reduceTime(5);
    });

    // Event Keyboard (Esc = Pause, Space = Ganti Senjata)
    window.addEventListener("keydown", (e) => {
      if (!this.isPlaying) return;

      if (e.key === "Escape") {
        this.togglePause();
      } else if (e.code === "Space") {
        e.preventDefault();
        this.gunManager.switchGun();
      }
    });

    // Continue button pada Pause Screen
    document.getElementById("btn-continue").addEventListener("click", () => {
      this.resumeGame();
    });

    // Game Over Buttons
    document.getElementById("btn-save-score").addEventListener("click", () => this.saveScore());
    document.getElementById("btn-restart").addEventListener("click", () => this.restartGame());

    // Sort Leaderboard Filter
    document.getElementById("sort-leaderboard").addEventListener("change", () => this.renderLeaderboard());
  }

  // Proses Countdown 3 Detik sebelum main
  startCountdownAndPlay() {
    // Simpan data konfigurasi pilihan
    const username = document.getElementById("username").value;
    const selectedGun = document.querySelector('input[name="gun"]:checked').value;
    const selectedTarget = document.querySelector('input[name="target"]:checked').value;

    this.player.setName(username);
    this.gunManager.setInitialGun(selectedGun);
    this.targetManager.setTargetImage(selectedTarget);

    // Tampilkan screen game & overlay countdown
    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    document.getElementById("display-name").textContent = this.player.name;
    document.getElementById("display-score").textContent = "0";

    this.runCountdown(3, () => {
      this.startGameplay();
    });
  }

  runCountdown(seconds, onComplete) {
    const overlay = document.getElementById("overlay");
    const overlayText = document.getElementById("overlay-text");
    const continueBtn = document.getElementById("btn-continue");

    continueBtn.classList.add("hidden");
    overlay.classList.remove("hidden");

    let count = seconds;
    overlayText.textContent = count;

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        overlayText.textContent = count;
      } else {
        clearInterval(interval);
        overlay.classList.add("hidden");
        onComplete();
      }
    }, 1000);
  }

  // Memulai Gameplay Aktif
  startGameplay() {
    this.isPlaying = true;
    this.isPaused = false;

    // Tentukan Durasi Timer berdasarkan Level
    const level = document.getElementById("level-select").value;
    let timeLimit = 30;
    if (level === "medium") timeLimit = 20;
    if (level === "hard") timeLimit = 15;

    this.timer.start(timeLimit);
    this.targetManager.startSpawning((hit) => this.onTargetHit(hit));
  }

  // Tembakan berhasil kena target
  onTargetHit(isHit) {
    if (!this.isPlaying || this.isPaused) return;

    if (isHit) {
      this.player.addScore(10);
      document.getElementById("display-score").textContent = this.player.score;
    }
  }

  // Tampilkan waktu
  updateTimerDisplay(seconds) {
    const secStr = seconds < 10 ? `0${seconds}` : seconds;
    document.getElementById("display-timer").textContent = `00:${secStr}`;
  }

  // Fungsi Pause / Unpause
  togglePause() {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;
    this.timer.stop();
    this.targetManager.stopSpawning();

    const overlay = document.getElementById("overlay");
    const overlayText = document.getElementById("overlay-text");
    const continueBtn = document.getElementById("btn-continue");

    overlayText.textContent = "GAME PAUSED";
    continueBtn.classList.remove("hidden");
    overlay.classList.remove("hidden");
  }

  resumeGame() {
    document.getElementById("overlay").classList.add("hidden");
    this.runCountdown(3, () => {
      this.isPaused = false;
      this.timer.start(this.timer.remainingTime);
      this.targetManager.startSpawning((hit) => this.onTargetHit(hit));
    });
  }

  // Selesai Game
  onGameOver() {
    this.isPlaying = false;
    this.targetManager.stopSpawning();
    this.targetManager.clearAll();

    document.getElementById("final-name").textContent = this.player.name;
    document.getElementById("final-score").textContent = this.player.score;
    document.getElementById("gameover-modal").classList.remove("hidden");
  }

  // Simpan Ke LocalStorage
  saveScore() {
    const history = JSON.parse(localStorage.getItem("shooter_history") || "[]");
    history.push({
      name: this.player.name,
      score: this.player.score,
      date: new Date().getTime()
    });

    localStorage.setItem("shooter_history", JSON.stringify(history));
    this.renderLeaderboard();
    alert("Skor Berhasil Disimpan!");
  }

  // Render Sidebar Leaderboard
  renderLeaderboard() {
    const historyList = document.getElementById("history-list");
    const sortBy = document.getElementById("sort-leaderboard").value;
    let history = JSON.parse(localStorage.getItem("shooter_history") || "[]");

    if (sortBy === "score") {
      history.sort((a, b) => b.score - a.score);
    } else {
      history.sort((a, b) => b.date - a.date);
    }

    historyList.innerHTML = "";
    history.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.name} - Skor: ${item.score}`;
      historyList.appendChild(li);
    });
  }

  // Restart Ke Halaman Utama
  restartGame() {
    document.getElementById("gameover-modal").classList.add("hidden");
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("welcome-screen").classList.remove("hidden");
  }
}

// Inisialisasi Game saat dokumen siap
window.addEventListener("DOMContentLoaded", () => {
  new Game();
});