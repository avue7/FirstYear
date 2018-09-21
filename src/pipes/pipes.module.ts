import { NgModule } from '@angular/core';
import { HoursMinutesSecondsPipe } from './hours-minutes-seconds/hours-minutes-seconds';
@NgModule({
	declarations: [HoursMinutesSecondsPipe],
	imports: [],
	exports: [HoursMinutesSecondsPipe]
})
export class PipesModule {}
