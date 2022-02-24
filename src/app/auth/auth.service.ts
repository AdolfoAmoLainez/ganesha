import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLogged = false;
  username = '';
  userId = 0;


  loginError = new Subject<string>();

  constructor(private router: Router,
              private http: HttpClient) {}

  login(username: string, passwd: string) {

    this.validaUsuari(username, passwd).subscribe(
      (data) => {
        console.log(data);

        if (data.status === 'success') {
          this.isLogged = true;
          this.username = username;
          localStorage.setItem('currentUser', username);
          this.userId = data.perfils[0].id;
          this.router.navigate(['/' , data.perfils[0].perfil]);
        } else {
          this.loginError.next(data.message);
        }
      }
    );

  }


  getPerfil() {
    this.username = localStorage.getItem('currentUser');
    if (this.username == undefined) {
      this.logout();
      return undefined;
    } else {
      const obj = {
        username: this.username
      };
      return this.http.post<{status: string , message: string, perfils: [{perfil: string}]}>
      (environment.selfApiUrl + 'get_perfil_usuari', obj);
    }
  }

  getUsername() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser == undefined) {
        this.logout();
        return undefined;
    } else {
        return currentUser;
      }
  }

  logout() {
    this.isLogged = false;
    this.username = '';
    this.userId = 0;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/' , 'login']);
  }

  validaUsuari(username: string, passwd: string) {
    const obj = {
      username,
      passwd
    };

    return this.http.post<{status: string , message: string, perfils: [{perfil: string, id: number}]}>
      (environment.selfApiUrl + 'valida_usuari', obj);
  }
}
