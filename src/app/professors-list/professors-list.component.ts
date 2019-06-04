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

  assignaturaId: string;
  assignatura: Assignatura;

  perfil = 'adm';
  paramsSubs: Subscription;
  profesUpdatedSubs: Subscription;

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
      () => {
        this.loadProfessors();
      }
    );

  }
  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
    this.profesUpdatedSubs.unsubscribe();
  }

  loadProfessors() {
    this.isLoading = true;

    this.dbService.getAssignatura(this.assignaturaId).subscribe(
      (assig: Assignatura) => {
        this.assignatura = assig;
        this.dbService.getProfessorsAssignatura(this.assignaturaId).subscribe(
          (data: any) => {
            this.professors = data.json;
            this.isLoading = false;
          }
        );
      }
    );

  }

  onDeleteIconClick(id: number, profeNom: string) {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Professor';
    modalRef.componentInstance.missatge = 'Vols esborrar el professor ' + profeNom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar el professor!' + resposta);
        //this.professors.splice(id, 1);
        this.dbService.deleteProfessorAssignatura(id).subscribe(
          (data) => {
            console.log(data);
            this.loadProfessors();
          }
        );
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onCheckProfessorClick(profeId: number, value: boolean) {
    if (value) {
      this.selectedProfessors.push(profeId);
    } else {
      this.selectedProfessors.splice(this.selectedProfessors.indexOf(profeId), 1);
    }
  }

  onAfegirClick(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (niu) => {
        console.log('Vol afegir el niu ' + niu + '.');
        const professor: Professor = {
          id: null,
          niu: niu,
          nom: "Buscar a LDAP?",
          assignatura_id: this.assignaturaId
        };

        this.dbService.addProfessorAssignatura(professor, this.assignatura);
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
        this.dbService.deleteProfessorsAssignatura(this.selectedProfessors.join()).subscribe(
          (data: any) => {
            console.log(data);
            this.selectedProfessors.forEach(
              (selectedProfe) => {
                this.professors = this.professors.filter(
                  (value) => {
                    return value.id !== selectedProfe;
                  }
                );
              }
            );
            this.selectedProfessors = [];
          }
        );

      },
      () => {
        console.log('Cancelado');
      }
    );
  }

}
