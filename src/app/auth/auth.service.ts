import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataBaseService } from '../shared/database.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLogged = false;
  username = '';


  loginError = new Subject<string>();

  constructor(private router: Router, private dbService: DataBaseService) {}

  login(username: string, passwd: string) {

    this.dbService.validaUsuari(username, passwd).subscribe(
      (data) => {
        if (data.status === 'success') {
          this.isLogged = true;
          this.username = username;
          this.router.navigate(['/' , data.perfils[0].perfil]);
        } else {
          this.loginError.next(data.message);
        }
      }
    );

  }

  getPerfil() {
    return this.dbService.getPerfil(this.username);
  }

  logout() {
    this.isLogged = false;
    this.username = '';
    this.router.navigate(['/' , 'login']);
  }
}
