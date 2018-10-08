import { NgModule } from '@angular/core';
import { HoursMinutesSecondsPipe } from './hours-minutes-seconds/hours-minutes-seconds';
import { DateTimePipe } from './date-time/date-time';
import { GroupbyPipe } from './groupby/groupby';
import { MomentPipe } from './moment/moment';
@NgModule({
	declarations: [HoursMinutesSecondsPipe,
    DateTimePipe,
    GroupbyPipe,
    MomentPipe],
	imports: [],
	exports: [HoursMinutesSecondsPipe,
    DateTimePipe,
    GroupbyPipe,
    MomentPipe]
})
export class PipesModule {}
