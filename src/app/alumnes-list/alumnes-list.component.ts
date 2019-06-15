import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';
import { Subscription } from 'rxjs';
import { DataBaseService } from '../shared/database.service';
import { Alumne } from '../shared/alumne.model';
import { Grup } from '../shared/grup.model';

@Component({
  selector: 'app-alumnes-list',
  templateUrl: './alumnes-list.component.html' ,
  styleUrls: ['./alumnes-list.component.css']
})
export class AlumnesListComponent implements OnInit, OnDestroy {
  perfil = 'profe';

  alumnes: Alumne[] = [];

  selectedAlumnes = [];

  isLoading = true;

  assignaturaCodi = '';
  grupId;
  grup: Grup;
  paramsSubs: Subscription;
  alumnesUpdatedSubs: Subscription;
  alumnesChangedSubs: Subscription;

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService) { }

  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
    this.alumnesUpdatedSubs.unsubscribe();
    this.alumnesChangedSubs.unsubscribe();
  }

  ngOnInit() {
    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    this.alumnesUpdatedSubs = this.dbService.alumnesUpdated.subscribe(
      (alumnes) => {
        this.alumnes = alumnes;
        this.isLoading = false;
      }
    );

    this.alumnesChangedSubs = this.dbService.alumnesChanged.subscribe(
      () => {
        this.loadAlumnes();
      }
    );

    if (this.activatedRoute.paramMap) {
      this.paramsSubs = this.activatedRoute.paramMap.subscribe(
        (paramMap: ParamMap) => {
          if (paramMap.has('grupid')) {
            this.grupId = paramMap.get('grupid');
            this.loadAlumnes();
          }
        });
    }
  }

  loadAlumnes() {
    this.isLoading = true;

    this.dbService.getGrupInfo(this.grupId).subscribe(
      (grupInfo: any) => {

        this.grup = grupInfo.grup;
        this.assignaturaCodi = grupInfo.assignatura_codi;

        this.dbService.getAlumnesGrup(this.grupId);

      }
    );
  }

  onDeleteIconClick(alumne: Alumne) {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumne';
    modalRef.componentInstance.missatge = 'Vols esborrar l\'alumne ' + alumne.nom + '?';
    modalRef.result.then(
      (resposta) => {
        // console.log('Vol esborrar l\'alumne!' + resposta);
        this.dbService.deleteAlumnesGrup([alumne],
                                         this.assignaturaCodi + '-g' + this.grup.ordre,
                                        this.assignaturaCodi );
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onCheckAlumneClick(alumne: Alumne, value: boolean) {
    if (value) {
      this.selectedAlumnes.push(alumne);
    } else {
      this.selectedAlumnes.splice(this.selectedAlumnes.indexOf(alumne), 1);
    }
  }

  onAfegirClick(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (niu) => {
        // console.log('Vol afegir el niu ' + niu + '.');
        const al: Alumne = {
          id: null,
          niu,
          nom: 'El busquem a LDAP?',
          grup_id: this.grupId
        };
        this.dbService.addAlumneGrup(al, this.assignaturaCodi + '-g' + this.grup.ordre, this.assignaturaCodi);
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onBackClick() {
    this.myLocation.back();
  }

  onDeleteAlumnes() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumnes';
    modalRef.componentInstance.missatge = 'Vols esborrar els alumnes sel·leccionats?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar tots els alumnes.');
        this.dbService.deleteAlumnesGrup(this.selectedAlumnes,
                                         this.assignaturaCodi + '-g' + this.grup.ordre,
                                         this.assignaturaCodi);
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

}
