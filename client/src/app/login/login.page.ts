import { Component, OnInit } from '@angular/core';
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

  validate(email, password) {
    if (!email || !password) {
      return true;
    }
    return false;
  }

  login(email, password) {
    // try to authenticate with feathers
    this.feathers.login({
      strategy: 'local',
      email,
      password
    }).then(() => { // navigate to base URL on success
      this.router.navigate(['/']);
    }).catch(err => {
      console.log(err);
      this.toast.create({
        message: `登录失败: ${err.detail}`,
        duration: 2000
      }).then(toast => toast.present());
    });
  }

  ngOnInit() {
  }

}
