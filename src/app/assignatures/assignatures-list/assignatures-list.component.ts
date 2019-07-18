import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { DataBaseService } from 'src/app/shared/database.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Assignatura } from 'src/app/shared/assignatura.model';
import { AuthService } from 'src/app/auth/auth.service';

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
              private router: Router,
              private authService: AuthService) { }


  ngOnInit() {
    this.authService.getPerfil().subscribe(
      (data) => {
        this.perfil = data.perfils[0].perfil;

        if (this.perfil === 'adm') {
          this.dbService.getAssignatures();
        } else {
          this.dbService.getAssignaturesProfessor(this.authService.getUsername());
        }

        this.assignaturesUpdatedSubs = this.dbService.assignaturesUpdated.subscribe(
          (assignatures: Assignatura[]) => {
            this.assignatures = assignatures;
          }
        );
      }
    );
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
