import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FeathersService } from '../services/feathers.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private feathers: FeathersService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    /* Try to auth with the server. If authed resolve to true, else resolve to false */
    return this.feathers
      .login()
      .then(() => true)
      .catch(() => {
        this.router.navigate(['/login']);
        return false;
      });
  }
}
