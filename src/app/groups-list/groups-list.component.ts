import { Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';


@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css']
})
export class GroupsListComponent implements OnInit, OnDestroy {

  perfil = 'profe';
  groups = [];
  selectedGroups = [];
  groupToDel: string;

  paramsSubs: Subscription;

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location) { }

  ngOnInit() {

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.perfil === 'adm') {
      this.paramsSubs = this.activatedRoute.parent.params.subscribe(
        (params) => {
          this.groups = [
            {
              id: 1 + params.assignaturaid * 10,
              nom: '11223311-g01',
              ordre: 1
            },
            {
              id: 2 + params.assignaturaid * 10,
              nom: '11223311-g02',
              ordre: 2
            },
            {
              id: 3 + params.assignaturaid * 10,
              nom: '11223311-g03',
              ordre: 3
            }
          ];
        }
        );
    } else {
      this.paramsSubs = this.activatedRoute.params.subscribe(
        (params) => {
          this.groups = [
            {
              id: 1 + params.assignaturaid * 10,
              nom: '11223311-g01',
              ordre: 1
            },
            {
              id: 2 + params.assignaturaid * 10,
              nom: '11223311-g02',
              ordre: 2
            },
            {
              id: 3 + params.assignaturaid * 10,
              nom: '11223311-g03',
              ordre: 3
            }
          ];
        }
        );
      }
  }

  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
  }

  onDeleteGroups() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Grups';
    modalRef.componentInstance.missatge = 'Vols esborrar els grups sel·leccionats?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar tots els grups.');
        this.selectedGroups.forEach(
          (selectedGroup) => {
            this.groups = this.groups.filter(
              (value) => {
                return value.id !== selectedGroup;
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

  onCheckGroupClick(groupId: number, value: boolean) {

    if (value) {
      this.selectedGroups.push(groupId);
    } else {
      this.selectedGroups.splice(this.selectedGroups.indexOf(groupId), 1);
    }
  }

  onAfegirClick(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (quantitat) => {
        console.log('Vol crear ' + quantitat + ' grups.');
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onDeleteIconClick(id: number, grupNom: string) {

    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Grup';
    modalRef.componentInstance.missatge = 'Vols esborrar els grups ' + grupNom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar el grup!' + resposta);
        this.groups.splice(id, 1);
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
