import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FeathersService } from '../services/feathers.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  constructor(private feathers: FeathersService, private router: Router) { }

  validate(email, password) {
    if (!email || !password) {
      return true;
    }
    return false;
  }

  login(email: string, password: string) {
    // try to authenticate with feathers
    this.feathers.login({
      strategy: 'local',
      email,
      password
    }).then(() => { // navigate to base URL on success
      this.router.navigate(['/']);
    }).catch(err => {
      console.log(err);
    });
  }

  ngOnInit() {
  }

}
