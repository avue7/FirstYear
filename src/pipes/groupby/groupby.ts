import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the GroupbyPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'groupby',
})
export class GroupbyPipe implements PipeTransform {
  transform(value: any, groupByKey: string) {
    const events: any[] = [];
    const groupedElements: any = {};

    value.forEach((obj: any) => {
      if (!(obj[groupByKey] in groupedElements)) {
        groupedElements[obj[groupByKey]] = [];
      }
      groupedElements[obj[groupByKey]].push(obj);
    });

    for (let prop in groupedElements) {
      if (groupedElements.hasOwnProperty(prop)) {
        events.push({
          key: prop,
          list: groupedElements[prop]
        });
      }
    }

    return events;
  }
}
