import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  email: string;
  password: string;
  confirmPassword: string;

  constructor(private feathers: FeathersService, private toast: ToastController) { }

  ngOnInit() {
  }

  onChange(type: string, event: CustomEvent) {
    if (type === 'email') {
      this.email = event.detail.value;
    } else if (type === 'password') {
      this.password = event.detail.value;
    } else if (type === 'confirm-password') {
      this.confirmPassword = event.detail.value;
    }
  }

  validate(email: string, password: string, confirmPassword: string): boolean {
    if (!email || !password || !confirmPassword) {
      return true;
    }
    if (password !== confirmPassword) {
      return true;
    }
    return false;
  }

  signUp(email, password) {
    this.feathers.service('users').create({
      email, password
    }).then(user => {
      this.toast.create({
        message: `${user.email} 注册成功`,
        duration: 2000
      }).then(toast => {
        toast.present();
      });
    }).catch(e => {
      this.toast.create({
        message: `注册失败`,
        duration: 2000
      }).then(toast => {
        toast.present();
      });
    });
  }
}
