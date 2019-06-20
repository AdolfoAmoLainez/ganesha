import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'ganesha';
  perfil = 'professor';


  constructor(private router: Router,
              private authService: AuthService) {}

  ngAfterViewInit(): void {

/*     this.authService.getPerfil().subscribe(
      (data) => {
        this.perfil = data.perfils[0].perfil;
      }
    ) */
    if (this.perfil === 'adm') {
      //console.log('por aqui');

      //this.router.navigate([{outlets: {primary: ['assignatura', 1], leftbar: ['adm']}}]);
      //this.router.navigate( ['assignatura', 1]);
    } else {

      //this.router.navigate(['professor']);
    }
  }



}
