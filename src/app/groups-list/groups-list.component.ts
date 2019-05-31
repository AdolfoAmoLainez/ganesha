import { Component, OnInit, OnDestroy} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';
import { DataBaseService } from '../shared/database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Assignatura } from '../shared/assignatura.model';


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
  assignaturaId;
  assignatura: Assignatura;
  isLoading = true;
  factorUnitats: number;

  addGroupsFrom: FormGroup;

  paramsSubs: Subscription;

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService) { }

  ngOnInit() {

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.perfil === 'adm') {

      if (this.activatedRoute.parent.paramMap) {
        this.paramsSubs = this.activatedRoute.parent.paramMap.subscribe(
          (paramMap: ParamMap) => {
            if (paramMap.has('assignaturaid')) {
              this.assignaturaId = paramMap.get('assignaturaid');
              this.loadGrups();
            }
          });
      }

    } else {

      if (this.activatedRoute.paramMap) {
        this.paramsSubs = this.activatedRoute.paramMap.subscribe(
          (paramMap: ParamMap) => {
            if (paramMap.has('assignaturaid')) {
              this.assignaturaId = paramMap.get('assignaturaid');
              this.loadGrups();
            }
          });
      }

    }

    this.dbService.getFactorUnitats().subscribe(
      (resultat) => {
        this.factorUnitats = resultat.json[0].factor;
      }
    );
  }

  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
  }

  loadGrups() {
    this.isLoading = true;

    this.dbService.getAssignatura(this.assignaturaId).subscribe(
      (assig: Assignatura) => {
        this.assignatura = assig;

        this.dbService.getGrupsAssignatura(this.assignaturaId).subscribe(
          (data: any) => {
            this.groups = data.json;
            this.isLoading = false;
          }
        );
      }
    );

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
    this.addGroupsFrom = new FormGroup({
        quantitat: new FormControl(1, [ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        quota: new FormControl(1, [ Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)])
      }
    );

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (resposta) => {
        console.log('Vol crear ' + resposta.quantitat + ' grups.');
        console.log('Amb quota ' + resposta.quota + ' minuts. Que son ' + (resposta.quota * this.factorUnitats).toFixed(1) + 'Gb.');
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
