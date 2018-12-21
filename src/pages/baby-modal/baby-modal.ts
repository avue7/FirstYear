import { Component } from '@angular/core';
import { ViewController, NavParams} from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-baby-modal',
  templateUrl: 'baby-modal.html',
})
export class BabyModalPage {
  babyInfoForm: FormGroup;
  gender: string = "male";
  addBabyFlag: boolean;

  constructor( private view: ViewController,
    fb: FormBuilder,
    private navParams: NavParams) {
    this.babyInfoForm = fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      birthday: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.required])]
    });

    let flag = this.navParams.get('flag');
    if(flag){
      this.addBabyFlag = true;
    } else {
      this.addBabyFlag = false;
    };
  }

  setBabyInfo(){
    let data = this.babyInfoForm.value;
    console.log(data);
    this.view.dismiss(data);
  }

  cancelModal(){
    this.view.dismiss();
  }
}
