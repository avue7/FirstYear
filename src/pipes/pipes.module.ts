import { NgModule } from '@angular/core';
import { HoursMinutesSecondsPipe } from './hours-minutes-seconds/hours-minutes-seconds';
import { DateTimePipe } from './date-time/date-time';
@NgModule({
	declarations: [HoursMinutesSecondsPipe,
    DateTimePipe],
	imports: [],
	exports: [HoursMinutesSecondsPipe,
    DateTimePipe]
})
export class PipesModule {}
