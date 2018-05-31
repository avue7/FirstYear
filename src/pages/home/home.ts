import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';

// Pages:
import { FeedingPage } from '../feeding/feeding';
import { DiaperingPage } from '../diapering/diapering';
import { SleepingPage } from '../sleeping/sleeping';
import { PlayingPage } from '../playing/playing';
import { GrowthPage } from '../growth/growth';
import { CameraPage } from '../camera/camera';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pages: Array<{component: any, icon: string}>;

  segmentType = 'Activities';

  segments: any = {
    'Activities': [
      { component: FeedingPage, icon: 'custom-bottle' },
      { component: DiaperingPage, icon: 'custom-diaper' },
      { component: SleepingPage, icon: 'custom-sleeping-baby' },
      { component: PlayingPage, icon: 'custom-cubes' },
      { component: GrowthPage, icon: 'custom-growth' },
      { component: CameraPage, icon: 'md-camera' }
    ],
    'Charts': [
      {
        name: 'Diaper chart'
      }
    ],
    'Chats': [
      {
        name: 'Main Chat'
      }
    ]
  }

  constructor(public navCtrl: NavController,
    private menu: MenuController,
    private user: UserProvider) {
    this.enableMenu();
  }

  openPage(page: any) {
    this.navCtrl.push(page.component);
  }

  getSegments(type: any){
    return this.segments[type];
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
