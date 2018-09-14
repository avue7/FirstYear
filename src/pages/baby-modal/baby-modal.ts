import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-baby-modal',
  templateUrl: 'baby-modal.html',
})
export class BabyModalPage {
  babyInfoForm: FormGroup;
  baby = {
    firstName: '',
    lastName: '',
    birthday: ''
  };

  constructor(private navParams: NavParams,
    private view: ViewController,
    fb: FormBuilder) {
    this.babyInfoForm = fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      birthday: ['', Validators.compose([Validators.required])]
    });
  }

  ionViewWillLoad(){
    const data = this.navParams.get('data');
    this.baby.firstName = data.firstName;
    this.baby.lastName = data.lastName;
  }

  getBabyInfo(){
    console.log(this.baby);
    this.baby = this.babyInfoForm.value;
    this.closeModal();
  }

  closeModal(){
    // const data = {
    //   firstName:
    //   lastName:
    //   age:
    // }
    this.view.dismiss();
  }

  cancelModal(){
    this.view.dismiss();
  }
}
