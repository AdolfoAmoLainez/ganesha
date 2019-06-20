import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataBaseService } from 'src/app/shared/database.service';
import { Assignatura } from 'src/app/shared/assignatura.model';

@Component({
  selector: 'app-assignatura-view',
  templateUrl: './assignatura-view.component.html',
  styleUrls: ['./assignatura-view.component.css']
})
export class AssignaturaViewComponent implements OnInit, OnDestroy {

  assignaturaId;
  assignaturaNom = '';
  paramsSubs: Subscription;
  assignaturaChangedSubs: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private dbService: DataBaseService) { }

  ngOnInit() {

    if (this.activatedRoute.paramMap) {

      this.paramsSubs = this.activatedRoute.params.subscribe(
        (params) => {
          this.assignaturaId = +params.assignaturaid;
          this.dbService.getAssignatura(this.assignaturaId).subscribe (
            (assignatura) => {
              this.assignaturaNom = assignatura.codi + ' - ' + assignatura.nom;
            }
          );
        });
    }

    this.assignaturaChangedSubs = this.dbService.assignaturaChanged.subscribe(
      (assignatura: Assignatura) => {
        if (assignatura.id === this.assignaturaId) {
          this.assignaturaNom = assignatura.codi + ' - ' + assignatura.nom;
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.paramsSubs.unsubscribe();
    this.assignaturaChangedSubs.unsubscribe();
  }

}
