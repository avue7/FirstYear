import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { FormattedTodayProvider} from '../../providers/formatted-today/formatted-today';

@Injectable()
export class TimerProvider {
  tick: any;
  timerSubscription: any;
  restartTime: number;
  isPaused: boolean;
  startedOnce: boolean;
  isPausedDateTime: any;


  constructor( private ft: FormattedTodayProvider) {
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
        this.isPausedDateTime = this.ft.getTodayMonthFirstWithTime();
        console.log("Timer: isPausedDateTime is:", this.isPausedDateTime);
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
