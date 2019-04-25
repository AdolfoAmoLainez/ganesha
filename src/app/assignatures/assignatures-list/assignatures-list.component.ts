import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataBaseService } from 'src/app/shared/database.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Assignatura } from 'src/app/shared/assignatura.model';

@Component({
  selector: 'app-assignatures-list',
  templateUrl: './assignatures-list.component.html',
  styleUrls: ['./assignatures-list.component.css']
})
export class AssignaturesListComponent implements OnInit, OnDestroy {

  assignatures = [];
  perfil = 'adm';
  assignaturesSubs: Subscription;

  constructor(private dbService: DataBaseService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    //this.assignatures = this.dbService.getAssignatures();
    this.assignaturesSubs = this.dbService.assignaturesUpdated.subscribe(
      (assignatures: Assignatura[]) => {
        this.assignatures = assignatures;
      }
    );
    this.dbService.getAssignatures();
    this.perfil = this.route.snapshot.data.perfil;

  }

ngOnDestroy() {
  this.assignaturesSubs.unsubscribe();
}

  onAssignaturaClick(codi) {
    this.router.navigate(['assignatura',codi]);
  }

  onAssignaturaProfeClick(codi) {
    this.router.navigate(['professor', 'grups', codi]);
  }

  onAssignaturaAddClick() {
    this.router.navigate(['addassignatura']);
  }

}
