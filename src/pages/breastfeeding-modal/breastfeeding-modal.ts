import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-breastfeeding-modal',
  templateUrl: 'breastfeeding-modal.html',
})
export class BreastfeedingModalPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BreastfeedingModalPage');
  }

}
