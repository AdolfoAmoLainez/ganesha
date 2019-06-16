import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataBaseService } from 'src/app/shared/database.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Assignatura } from 'src/app/shared/assignatura.model';
import { relative } from 'path';

@Component({
  selector: 'app-assignatures-list',
  templateUrl: './assignatures-list.component.html',
  styleUrls: ['./assignatures-list.component.css']
})
export class AssignaturesListComponent implements OnInit, OnDestroy {

  assignatures = [];
  perfil = 'adm';
  assignaturesUpdatedSubs: Subscription;

  constructor(private dbService: DataBaseService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    //this.assignatures = this.dbService.getAssignatures();
    this.assignaturesUpdatedSubs = this.dbService.assignaturesUpdated.subscribe(
      (assignatures: Assignatura[]) => {
        this.assignatures = assignatures;
      }
    );
    this.dbService.getAssignatures();
    if (this.route.snapshot.data.perfil) {
      this.perfil = this.route.snapshot.data.perfil;
    }
  }

ngOnDestroy() {
  this.assignaturesUpdatedSubs.unsubscribe();
}

  onAssignaturaClick(codi) {
    this.router.navigate(['adm', 'assignatura', codi]);
  }

  onAssignaturaProfeClick(codi) {
    this.router.navigate(['professor', 'grups', codi]);
  }

  onAssignaturaAddClick() {
    this.router.navigate(['adm', 'addassignatura']);
  }

  onUsuarisClick() {
    this.router.navigate(['adm', 'usuaris']);
  }

}
