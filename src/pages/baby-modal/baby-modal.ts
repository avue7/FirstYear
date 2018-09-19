import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'page-baby-modal',
  templateUrl: 'baby-modal.html',
})
export class BabyModalPage {
  babyInfoForm: FormGroup;

  constructor( private view: ViewController,
    fb: FormBuilder) {
    this.babyInfoForm = fb.group({
      firstName: ['', Validators.compose([Validators.required])],
      lastName: ['', Validators.compose([Validators.required])],
      birthday: ['', Validators.compose([Validators.required])]
    });
  }

  getBabyInfo(){
    let data = this.babyInfoForm.value;
    console.log(data);
    this.view.dismiss(data);
  }

  cancelModal(){
    this.view.dismiss();
  }
}
