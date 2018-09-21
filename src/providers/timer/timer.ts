import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

/*
  Generated class for the TimerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TimerProvider {
  tick: number;
  timerSubscription: any;
  restartTime: number;

  constructor() {
    // this.initTimer();
  }

  startTimer(restartTime?: any){
    // let myObservable = Observable.timer(1000);
    //
    // myObservable.subscribe( x => console.log(x));
    if (restartTime){
      this.tick = restartTime;
    } else {
      this.tick = 0;
    };
    this.timerSubscription = Observable.interval(1000).subscribe(x => {
      console.log(this.tick);
      this.tick++;
    });
  }

  pauseTimer(){
    this.restartTime = this.tick;
    this.timerSubscription.unsubscribe();
  }

  stopTimer(){
    this.timerSubscription.unsubscribe();
  }

  resumeTimer(){
    let time = this.restartTime;
    this.startTimer(time);
  }


  // timerInit() {
  //   setTimeout(() => {
  //     this.timer.startTimer();
  //   }, 1000)
  // }

  // hasFinished() {
  //     return this.timer.hasFinished;
  // }
  //
  // initTimer() {
  //     if(!this.timeInSeconds) { this.timeInSeconds = 0; }
  //
  //     this.timer = <ITimer>{
  //         seconds: this.timeInSeconds,
  //         runTimer: false,
  //         hasStarted: false,
  //         hasFinished: false,
  //         secondsRemaining: this.timeInSeconds
  //     };
  //
  //     this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
  // }
  //
  // startTimer() {
  //     this.timer.hasStarted = true;
  //     this.timer.runTimer = true;
  //     this.timerTick();
  // }
  //
  // pauseTimer() {
  //     this.timer.runTimer = false;
  // }
  //
  // resumeTimer() {
  //     this.startTimer();
  // }
  //
  // timerTick() {
  //     setTimeout(() => {
  //         if (!this.timer.runTimer) { return; }
  //         this.timer.secondsRemaining--;
  //         this.timer.displayTime = this.getSecondsAsDigitalClock(this.timer.secondsRemaining);
  //         if (this.timer.secondsRemaining > 0) {
  //             this.timerTick();
  //         }
  //         else {
  //             this.timer.hasFinished = true;
  //         }
  //     }, 1000);
  // }
  //
  // getSecondsAsDigitalClock(inputSeconds: number) {
  //     var sec_num = parseInt(inputSeconds.toString(), 10); // don't forget the second param
  //     var hours   = Math.floor(sec_num / 3600);
  //     var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  //     var seconds = sec_num - (hours * 3600) - (minutes * 60);
  //     var hoursString = '';
  //     var minutesString = '';
  //     var secondsString = '';
  //     hoursString = (hours < 10) ? "0" + hours : hours.toString();
  //     minutesString = (minutes < 10) ? "0" + minutes : minutes.toString();
  //     secondsString = (seconds < 10) ? "0" + seconds : seconds.toString();
  //     return hoursString + ':' + minutesString + ':' + secondsString;
  // }

}
