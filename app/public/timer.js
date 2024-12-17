class Timer{
  constructor(time,el){
    this.originalTime = time;
    this.time = time;//in seconds
    this.el = el;
    this.intervalIds = [];
    this.lastTimestamp = null;
    this.isRunning = false;
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTimestamp = Date.now();
      this.intervalIds.push(setInterval(()=>{
        if (this.lastTimestamp) {
          const elapsed = (Date.now() - this.lastTimestamp) / 1000; // Elapsed time in seconds
          if(elapsed>=1){
            this.time -= elapsed;
            this.el.textContent = this.formatTime(Math.floor(this.time));
            this.lastTimestamp = Date.now();
          }
        }
      },300));
    }
  }

  stopTimer() {
    this.isRunning = false;
    this.lastTimestamp = null;

    for(const intervalId of this.intervalIds){
      clearInterval(intervalId);
    }
    this.intervalIds.length = 0;
  }

  reset(){
    this.time = this.originalTime;
    this.el.textContent = this.formatTime(Math.floor(this.time));
    this.stopTimer();
  }

  formatTime(seconds) {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  }
}
