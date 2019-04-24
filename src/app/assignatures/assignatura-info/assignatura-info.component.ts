import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assignatura-info',
  templateUrl: './assignatura-info.component.html',
  styleUrls: ['./assignatura-info.component.css']
})
export class AssignaturaInfoComponent implements OnInit {

  perfil = 'adm';

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }
  }

}
