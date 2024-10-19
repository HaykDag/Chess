class Timer{
  constructor(time,el){
    this.time = time;//in seconds
    this.el = el;
    this.intervalIds = [];
  }

  start(){

    this.intervalIds.push(setInterval(()=> {
      if(this.time<=0){
        this.pause();
        return;
      } 
      this.time --;
      
      // does the same job as parseInt truncates the float
      let minutes = (this.time / 60) | 0;
      let seconds = (this.time % 60) | 0;

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      
      this.el.innerText = `${minutes}:${seconds}`; 

    },1000));
  }

  pause(){
    for(const intervalId of this.intervalIds){
      clearInterval(intervalId);
    }
    this.intervalIds = [];
  }

  reset(){
    this.minutes = this.duration;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    this.seconds = "00";
    this.el.innerText = `${minutes}:${seconds}`; 
    this.pause();
  }

}
