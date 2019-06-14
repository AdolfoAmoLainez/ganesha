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
  assignaturaId;
  assignatura: Assignatura;
  isLoading = true;
  factorUnitats: number;
  minutsConsumits = 0;

  addGroupsFrom: FormGroup;

  paramsSubs: Subscription;
  grupsUpdatedSubs: Subscription;
  grupsChangedSubs: Subscription;

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService) { }

  ngOnInit() {

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    this.grupsUpdatedSubs = this.dbService.grupsUpdated.subscribe(
      (grups) => {
        console.log(grups);

        this.groups = grups;
        this.isLoading = false;
      }
    );

    this.grupsChangedSubs = this.dbService.grupsChanged.subscribe(
      () => {
        this.loadGrups();
      }
    );

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
    this.grupsUpdatedSubs.unsubscribe();
    this.grupsChangedSubs.unsubscribe();
  }

  loadGrups() {
    this.isLoading = true;

    this.dbService.getAssignatura(this.assignaturaId).subscribe(
      (assig: Assignatura) => {
        this.assignatura = assig;

        this.dbService.getGrupsAssignatura(this.assignaturaId);
        /*.subscribe(
          (data: any) => {
            this.groups = data.json;
            this.isLoading = false;
            this.selectedGroups = [];
          }
        );*/
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
        this.dbService.deleteGrupsAssignatura(this.selectedGroups);
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

    this.dbService.getMinutsConsumits(this.assignaturaId).subscribe(
      (respostaMinuts) => {
        console.log(respostaMinuts);

        this.minutsConsumits = respostaMinuts.consulta[0].consumits;

        this.addGroupsFrom = new FormGroup({
            quantitat: new FormControl(1, [ Validators.required, Validators.pattern(/^-?([1-9]\d*)?$/)]),
            quota: new FormControl(1, [ Validators.required, Validators.pattern(/^-?([1-9]\d*)?$/)]),
            disponibles: new FormControl(this.assignatura.tamany - this.minutsConsumits)
          }
        );

        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
          (resposta) => {
            if (this.addGroupsFrom.get('disponibles').value > 0){
            console.log('Vol crear ' + resposta.quantitat + ' grups.');
            console.log('Amb quota ' + resposta.quota + ' minuts. Que son ' + (resposta.quota * this.factorUnitats).toFixed(1) + 'Gb.');
            this.dbService.addGrupsAssignatura(this.assignatura, resposta.quantitat, resposta.quota, (resposta.quota * this.factorUnitats).toFixed(1) );
            } else {
              console.log("No es poden crear tants grups amb aquesta quota!!!!");

            }
          },
          () => {
            console.log('Cancelado');
          }
        );
      }

    );
  }

  onDeleteIconClick(id: number, grupNom: string) {

    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Grup';
    modalRef.componentInstance.missatge = 'Vols esborrar el grup ' + grupNom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar el grup!' + resposta);
        //this.groups.splice(id, 1);
        this.dbService.deleteGrupsAssignatura([id]);
      },
      () => {
        console.log('Cancelado');
      }
    );

  }

  onBackClick() {
    this.myLocation.back();
  }

  onAddGroupFormChangeValues(quantitat: number) {
    this.addGroupsFrom.patchValue({
      disponibles: (this.assignatura.tamany - this.minutsConsumits) -
                  (this.addGroupsFrom.get('quantitat').value * this.addGroupsFrom.get('quota').value)
    });
  }

}
