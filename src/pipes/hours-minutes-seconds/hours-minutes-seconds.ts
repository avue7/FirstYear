import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hoursMinutesSeconds',
})
export class HoursMinutesSecondsPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: number, args?) {
    let minutes = Math.floor(value / 60);
    let hours = Math.floor(minutes / 60);
    let seconds = Math.floor(value % 60);

    let timeString ="";
    if(args.hours && hours != 0) {
      timeString += hours + " hrs ";
    }
    args.minutes ? timeString += (minutes - (60 * hours))+ " mins " : true;
    args.seconds ? timeString += seconds + " secs " : true;

    return timeString;
  }
}
