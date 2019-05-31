import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'ganesha';
  perfil = 'profe';

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    if (this.perfil === 'adm') {
      //console.log('por aqui');

      this.router.navigate([{outlets: {primary: ['assignatura', 1], leftbar: ['adm']}}]);
    } else {

      this.router.navigate(['professor']);
    }
  }

}
