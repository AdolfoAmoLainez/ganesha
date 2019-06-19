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
  userId = 0;


  loginError = new Subject<string>();

  constructor(private router: Router, private dbService: DataBaseService) {}

  login(username: string, passwd: string) {

    this.dbService.validaUsuari(username, passwd).subscribe(
      (data) => {
        console.log(data);

        if (data.status === 'success') {
          this.isLogged = true;
          this.username = username;
          this.userId = data.perfils[0].id;
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
    this.userId = 0;
    this.router.navigate(['/' , 'login']);
  }
}
