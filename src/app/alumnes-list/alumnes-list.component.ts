import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alumnes-list',
  templateUrl: './alumnes-list.component.html' ,
  styleUrls: ['./alumnes-list.component.css']
})
export class AlumnesListComponent implements OnInit {

  alumnes = [];

  selectedAlumnes = [];

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location) { }

  ngOnInit() {
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
      }
    );
  }

  onDeleteIconClick(id: number) {
    this.alumnes.splice(id, 1);
  }

  onCheckAlumneClick(alumneId: number, value: boolean) {
    if (value) {
      this.selectedAlumnes.push(alumneId);
    } else {
      this.selectedAlumnes.splice(this.selectedAlumnes.indexOf(alumneId), 1);
    }
  }

  onDeleteAlumnes() {

    this.selectedAlumnes.forEach(
      (selectedAlumne) => {
        this.alumnes = this.alumnes.filter(
          (value) => {
            return value.id !== selectedAlumne;
          }
        );
      }
    );

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

}
