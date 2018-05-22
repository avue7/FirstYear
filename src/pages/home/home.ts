import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,
    private menu: MenuController) {
    this.enableMenu();
  }

  enableMenu(){
    this.menu.enable(true);
  }
}
