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

  alumnes = [];

  selectedAlumnes = [];

  isLoading = true;

  grupId;
  //grupNom = '';
  grupInfo;
  paramsSubs: Subscription;

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService) { }

  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
  }

  ngOnInit() {
    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.activatedRoute.paramMap) {
      this.paramsSubs = this.activatedRoute.paramMap.subscribe(
        (paramMap: ParamMap) => {
          if (paramMap.has('grupid')) {
            this.grupId = paramMap.get('grupid');
            this.loadAlumnes();
          }
        });
    }

    // this.activatedRoute.params.subscribe(
    //   (params) => {
    //     this.alumnes = [
    //       {
    //         id: 1,
    //         niu: 1112233,
    //         nom: 'Aitor Tilla Fria'
    //       },
    //       {
    //         id: 2,
    //         niu: 1112244,
    //         nom: 'Carmelo Cotón Maduro'
    //       },
    //       {
    //         id: 3,
    //         niu: 1112255,
    //         nom: 'Olga Rapata Perro'
    //       }
    //     ];
    //     this.selectedAlumnes = [];
    //   }
    // );
  }

  loadAlumnes() {
    this.isLoading = true;

    this.dbService.getGrupInfo(this.grupId).subscribe(
      (grup: any) => {

        this.grupInfo = grup;
        this.dbService.getAlumnesGrup(this.grupId).subscribe(
          (data: any) => {
            this.alumnes = data.json;
            this.isLoading = false;
          }
        );

      }
    );
  }

  onDeleteIconClick(id: number, alumneNom: string) {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumne';
    modalRef.componentInstance.missatge = 'Vols esborrar l\'alumne ' + alumneNom + '?';
    modalRef.result.then(
      (resposta) => {
        // console.log('Vol esborrar l\'alumne!' + resposta);
        this.dbService.deleteAlumneGrup(id).subscribe(
          (data) => {
            this.loadAlumnes();
          }
        );
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
        // console.log('Vol afegir el niu ' + niu + '.');
        const al: Alumne = {
          id: null,
          niu,
          nom: 'El busquem a LDAP?',
          grup_id: this.grupId
        };
        this.dbService.addAlumneGrup(al).subscribe(
          (data: any) => {
            this.alumnes.push(data.json[0]);
          }
        );
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
        this.dbService.deleteAlumnesGrup(this.selectedAlumnes.join()).subscribe(
          (data: any) => {
            this.selectedAlumnes.forEach(
              (selected) => {
                this.alumnes = this.alumnes.filter(
                  (value) => {
                    return value.id !== selected;
                  }
                );
              }
            );
            this.selectedAlumnes = [];
          }
        );
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

}
