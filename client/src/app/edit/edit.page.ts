import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {
  @Input() type: string;

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }

  onOk(event) {
    this.modalController.dismiss({
      text: "",
      tags: ["tag"]
    })
  }
}
