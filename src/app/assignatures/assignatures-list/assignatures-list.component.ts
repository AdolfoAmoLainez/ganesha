import { Component, OnInit } from '@angular/core';
import { DataBaseService } from 'src/app/shared/database.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-assignatures-list',
  templateUrl: './assignatures-list.component.html',
  styleUrls: ['./assignatures-list.component.css']
})
export class AssignaturesListComponent implements OnInit {

  assignatures = [];
  perfil = 'adm';

  constructor(private dbService: DataBaseService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.assignatures = this.dbService.getAssignatures();
    this.perfil = this.route.snapshot.data.perfil;

  }
  onAssignaturaClick(codi) {
    this.router.navigate(['assignatura',codi]);
  }

  onAssignaturaProfeClick(codi) {
    this.router.navigate(['professor', 'grups', codi]);
  }

}
