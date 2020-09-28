import { Injectable } from '@angular/core';
import * as feathersRx from 'feathers-reactive';
import * as io from 'socket.io-client';

import feathers from '@feathersjs/feathers';
import feathersSocketIOClient from '@feathersjs/socketio-client';
import feathersAuthClient2 from '@feathersjs/authentication-client';
import { AuthenticationRequest } from '@feathersjs/authentication/lib';

@Injectable({
  providedIn: 'root'
})
export class FeathersService {
  private _feathers = feathers();                     // init socket.io
  private _socket = io('http://localhost:3030');      // init feathers
  private feathersAuthClient = require('@feathersjs/authentication-client').default;

  constructor() {
    this._feathers
      .configure(feathersSocketIOClient(this._socket))  // add socket.io plugin
      .configure(this.feathersAuthClient({              // add authentication plugin
        storage: window.localStorage
      }))
      .configure(feathersRx({                           // add feathers-reactive plugin
        idField: '_id'
      }));
  }

  // expose services
  public service(name: string) {
    return this._feathers.service(name);
  }

  // expose authentication as login
  public login(credentials?: AuthenticationRequest) {
    return this._feathers.authenticate(credentials);
  }

  // expose logout
  public logout() {
    return this._feathers.logout();
  }
}
