import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  @Input() type: string;
  @ViewChild(IonInput) inputBox: IonInput;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
    setTimeout(() => {
      this.inputBox.setFocus().then(() => {
        console.log("Set Focus");
      });
    }, 500);
  }

  onChange(event) {
    // console.log(event);
  }

  onOk(text: string) {
    const tags = [];
    const activity = text.replace(/#[^\s]+(\s+|$)/g, (tag) => {
      tags.push(tag.trim().substring(1));
      return ''
    }).trim();
    this.modalController.dismiss({ activity, tags });
  }
}
