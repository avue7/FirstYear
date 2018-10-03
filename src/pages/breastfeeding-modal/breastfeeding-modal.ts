import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormattedTodayProvider } from '../../providers/formatted-today/formatted-today';
import * as moment from 'moment';

@Component({
  selector: 'page-breastfeeding-modal',
  templateUrl: 'breastfeeding-modal.html',
})
export class BreastfeedingModalPage {
  breastForm: FormGroup;
  breast: any = "left";
  today: any = moment().format();
  timeNow: any = moment().format();
  zeros: string = '00:00:00';


  constructor( private view: ViewController,
    fb: FormBuilder,
    private ft: FormattedTodayProvider) {
    this.breastForm = fb.group({
      breast: ['', Validators.compose([Validators.required])],
      date: ['', Validators.compose([Validators.required])],
      time: ['', Validators.compose([Validators.required])],
      duration: ['', Validators.compose([Validators.required])]
    });
  }
  
  manualAddBreast() {
    let data = this.breastForm.value;
    this.view.dismiss(data);
  }

  cancelModal(){
    this.view.dismiss();
  }

}
