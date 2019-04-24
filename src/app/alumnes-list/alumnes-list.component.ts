import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';

@Component({
  selector: 'app-alumnes-list',
  templateUrl: './alumnes-list.component.html' ,
  styleUrls: ['./alumnes-list.component.css']
})
export class AlumnesListComponent implements OnInit {
  perfil = 'profe';

  alumnes = [];

  selectedAlumnes = [];

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location) { }

  ngOnInit() {
    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
      console.log(this.activatedRoute.parent);

    }

    this.activatedRoute.params.subscribe(
      (params) => {
        this.alumnes = [
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
        this.selectedAlumnes = [];
      }
    );
  }

  onDeleteIconClick(id: number, alumneNom: string) {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumne';
    modalRef.componentInstance.missatge = 'Vols esborrar l\'alumne ' + alumneNom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar l\'alumne!' + resposta);
        this.alumnes.splice(id, 1);
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onCheckAlumneClick(alumneId: number, value: boolean) {
    if (value) {
      this.selectedAlumnes.push(alumneId);
    } else {
      this.selectedAlumnes.splice(this.selectedAlumnes.indexOf(alumneId), 1);
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

  onDeleteAlumnes() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumnes';
    modalRef.componentInstance.missatge = 'Vols esborrar els alumnes sel·leccionats?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar tots els alumnes.');
        this.selectedAlumnes.forEach(
          (selectedAlumne) => {
            this.alumnes = this.alumnes.filter(
              (value) => {
                return value.id !== selectedAlumne;
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
