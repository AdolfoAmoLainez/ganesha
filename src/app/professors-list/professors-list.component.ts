import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';

@Component({
  selector: 'app-professors-list',
  templateUrl: './professors-list.component.html' ,
  styleUrls: ['./professors-list.component.css']
})
export class ProfessorsListComponent implements OnInit {

  professors = [];

  selectedProfessors = [];

  perfil = 'adm';

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location) { }

  ngOnInit() {

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    this.activatedRoute.params.subscribe(
      (params) => {
        this.professors = [
          {
            id: 1,
            niu: 1112233,
            nom: 'Aitor Tilla Fria'
          },
          {
            id: 2,
            niu: 1112244,
            nom: 'Carmelo Cotón Maduro'
          },
          {
            id: 3,
            niu: 1112255,
            nom: 'Olga Rapata Perro'
          }
        ];
        this.selectedProfessors = [];
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
        this.professors.splice(id, 1);
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
        console.log('Vol esborrar tots els grups.');
        this.selectedProfessors.forEach(
          (selectedProfe) => {
            this.professors = this.professors.filter(
              (value) => {
                return value.id !== selectedProfe;
              }
            );
          }
        );
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

}
