import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';
import { DataBaseService } from '../shared/database.service';
import { Professor } from '../shared/professor.model';
import { Subscription } from 'rxjs';
import { Assignatura } from '../shared/assignatura.model';

@Component({
  selector: 'app-professors-list',
  templateUrl: './professors-list.component.html' ,
  styleUrls: ['./professors-list.component.css']
})
export class ProfessorsListComponent implements OnInit, OnDestroy {

  isLoading = true;

  professors = [];

  selectedProfessors = [];
  selectAll = false;

  assignaturaId: string;
  assignatura: Assignatura;

  perfil = 'adm';
  paramsSubs: Subscription;
  profesUpdatedSubs: Subscription;
  profesChangedSubs: Subscription;

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService) { }

  ngOnInit() {

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.activatedRoute.parent.paramMap) {
      this.paramsSubs = this.activatedRoute.parent.paramMap.subscribe(
        (paramMap: ParamMap) => {
          if (paramMap.has('assignaturaid')) {
            this.assignaturaId = paramMap.get('assignaturaid');
            this.loadProfessors();
          }
        });
    }

    this.profesUpdatedSubs = this.dbService.profesUpdated.subscribe(
      (profes: Professor[]) => {
        console.log(profes);

        this.professors = profes;
        this.isLoading = false;
      }
    );

    this.profesChangedSubs = this.dbService.profesChanged.subscribe(
      () => {
        this.loadProfessors();
      }
    )

  }
  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
    this.profesUpdatedSubs.unsubscribe();
    this.profesChangedSubs.unsubscribe();
  }

  loadProfessors() {
    this.isLoading = true;

    this.dbService.getAssignatura(this.assignaturaId).subscribe(
      (assig: Assignatura) => {
        this.assignatura = assig;
        this.dbService.getProfessorsAssignatura(this.assignaturaId);
        this.selectedProfessors = [];
      }
    );

  }

  onDeleteIconClick(profe: Professor, profeNom: string) {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Professor';
    modalRef.componentInstance.missatge = 'Vols esborrar el professor ' + profeNom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar el professor!' + resposta);
        this.dbService.deleteProfessorsAssignatura([profe], this.assignatura.codi);
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onCheckProfessorClick(profe: Professor, value: boolean) {
    if (value) {
      this.selectedProfessors.push(profe);
    } else {
      this.selectedProfessors.splice(this.selectedProfessors.indexOf(profe), 1);
    }
  }

  onAfegirClick(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (niu) => {
        console.log('Vol afegir el niu ' + niu + '.');
        const professor: Professor = {
          id: null,
          niu: niu,
          nom: 'Buscar a LDAP?',
          assignatura_id: this.assignaturaId
        };

        this.dbService.addProfessorAssignatura(professor, this.assignatura.codi);
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onBackClick() {
    this.myLocation.back();
  }

  onDeleteProfessors() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Professors';
    modalRef.componentInstance.missatge = 'Vols esborrar els professors sel·leccionats?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar tots els professors.');
        this.dbService.deleteProfessorsAssignatura(this.selectedProfessors, this.assignatura.codi);
        this.selectAll = false;
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onSelectAll(selectAllStatus: boolean) {
    if (selectAllStatus) {
      this.professors.forEach( element => {
          this.selectedProfessors.push(element);
      });
    } else {
      this.selectedProfessors = [];
    }

  }

}
