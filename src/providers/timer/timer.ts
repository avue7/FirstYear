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
  tick: any;
  timerSubscription: any;
  restartTime: number;
  isPaused: boolean;
  startedOnce: boolean;

  constructor() {
    // this.initTimer();
    this.tick = 0;
    this.startedOnce = false;
    this.isPaused = true;
  }

  startPauseTimer(){
    // let myObservable = Observable.timer(1000);
    //
    // myObservable.subscribe( x => console.log(x));
    if (this.isPaused){
      if(this.startedOnce){
        this.tick = this.restartTime;
      };
      this.timerSubscription = Observable.interval(1000).subscribe(x => {
        console.log(this.tick);
        this.tick++;
      });
    } else {
      this.restartTime = this.tick;
      this.startedOnce = true;
      this.timerSubscription.unsubscribe();
    };
    this.isPaused = !this.isPaused;
  }

  refreshTimer(){
    this.timerSubscription.unsubscribe();
    this.tick = 0;
    this.startedOnce = false;
    this.isPaused = true;
  }

}
