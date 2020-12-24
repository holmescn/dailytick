import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(private feathers: FeathersService, private toast: ToastController, private router: Router) { }

  async submit(form: NgForm) {
    try {
      const user = await this.feathers.login({
        strategy: 'local',
        email: form.value.email,
        password: form.value.password
      });
      console.log(user);
      this.router.navigate(['/tabs/tab_record']);
    } catch (err) {
      console.log(err);
      const toast = await this.toast.create({
        message: `登录失败: ${err.detail}`,
        duration: 2000
      });
      await toast.present();
    }
  }

  ngOnInit() {
  }

}
