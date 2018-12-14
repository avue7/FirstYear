import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class CalculateSleepDurationProvider {

  constructor() {

  }

  calculateDuration(sleepObject: any) : any {
    return new Promise(async resolve => {
      console.log("Sleep obeject in calcualet", sleepObject)

      let date: any;
      let dateEnd: any;
      let timeStart: any;
      let timeEnd: any;

      if(sleepObject.activity){
        date = sleepObject.dateStart;
        dateEnd = sleepObject.dateEnd;
        timeStart = sleepObject.time;
        timeEnd = sleepObject.timeEnd;
      } else {
        // Extract only the date
        date = this.getDate(sleepObject.dateStart);
        console.log("sleepObject::date is: ", date);
        dateEnd = this.getDate(sleepObject.dateEnd);
        console.log("sleepObject::dateEnd is: ", dateEnd);

        ///////////////////////////////////////////////////////////////
        // Extract only the time
        timeStart = this.getTime(sleepObject.timeStart);
        console.log("sleepObject::time is: ", timeStart);
        timeEnd = this.getTime(sleepObject.timeEnd);
        console.log("sleepObject::timeEnd is: ", timeEnd);
        /////////////////////////////////////////////////////////////////
      };

      // String up date and time and call the method to standardize the time
      let dateTime = date + " " + timeStart;
      let dateTimeEnd = dateEnd + " " + timeEnd;

      console.log("Date time start", dateTime)
      console.log("Date time end", dateTimeEnd)

      // Need to get the distance of the day start and day end
      let sleepDurationMoment = moment(dateTime, "MM-DD-YYYY HH:mm:ss").diff(moment(dateTimeEnd, "MM-DD-YYYY HH:mm:ss"));
      let sleepDuration = moment.duration(sleepDurationMoment);
      console.log("Days:", sleepDuration.days(), ", Hours:", sleepDuration.hours(), ", Minutes:", sleepDuration.minutes(), ", Seconds:", sleepDuration.seconds());

      let sleepDurationString: any = "";
      if(sleepDuration.months()){
        if(await Math.abs(sleepDuration.months()) == 1){
          sleepDurationString += await Math.abs(sleepDuration.months()) + " month";
        } else {
          sleepDurationString += await Math.abs(sleepDuration.months()) + " months";
        };
      }
      if(sleepDuration.days()){
        if(await Math.abs(sleepDuration.days()) == 1){
          sleepDurationString += await Math.abs(sleepDuration.days()) + " day";
        } else {
          sleepDurationString += " " + await Math.abs(sleepDuration.days()) + " days";
        };
      }
      if(sleepDuration.hours()){
        if(await Math.abs(sleepDuration.hours()) == 1){
          sleepDurationString += await Math.abs(sleepDuration.hours()) + " hr";
        } else {
          sleepDurationString += " " + await Math.abs(sleepDuration.hours()) + " hrs";
        };
      }
      if(await sleepDuration.minutes()){
        if(await Math.abs(sleepDuration.minutes()) == 1){
          sleepDurationString += await Math.abs(sleepDuration.minutes()) + " min";
        } else {
          sleepDurationString += " " + await Math.abs(sleepDuration.minutes()) + " mins";
        };
      }
      if(await sleepDuration.seconds()){
        if(await Math.abs(sleepDuration.seconds()) == 1){
          sleepDurationString += await Math.abs(sleepDuration.seconds()) + " sec";
        } else {
          sleepDurationString += " " + await Math.abs(sleepDuration.seconds()) + " secs";
        };
      }

      console.log("Sleepduration string is", sleepDurationString);
      resolve(sleepDurationString);
    });
  }

  getDate(dateParam : any) : any{
    let dateTemp = new Date(dateParam);
    let monthNumber = (Number(dateTemp.getMonth()) + 1);
    let monthString: string;

    // Add a 0 to month and days < 10
    if (monthNumber < 10){
      monthString = '0' + monthNumber.toString();
    } else {
      monthString = monthNumber.toString();
    };
    let dayNumber = (Number(dateTemp.getDate()));

    let dayString: string;
    if (dayNumber < 10){
      dayString = '0' + dayNumber.toString();
    } else {
      dayString = dayNumber.toString();
    };
    // Concentanate the strings
    let date = monthString + '-' + dayString + '-' + dateTemp.getFullYear();
    return date;
  }

  getTime(timeParam: any){
    let timeTemp = new Date(timeParam);

    let time = this.addZeroToTime(timeTemp.getHours()) + ':' + this.addZeroToTime(timeTemp.getMinutes()) + ':' +
    this.addZeroToTime(timeTemp.getSeconds());
    return time;
  }

  addZeroToTime(time : any) : any{
    if(time < 10){
      time = "0" + time;
    };
    return time;
  }
}
