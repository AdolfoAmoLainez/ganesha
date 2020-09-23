import { Component, OnInit, OnDestroy, AfterViewInit} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { MymodalyesnoComponent } from '../../shared/mymodalyesno/mymodalyesno.component';
import { DataBaseService } from '../../shared/database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Assignatura } from '../../shared/assignatura.model';
import { Grup } from '../../shared/grup.model';
import { AuthService } from '../../auth/auth.service';
import { GroupEditModalComponent } from '../group-edit-modal/group-edit-modal.component';
import { faBackspace, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.css']
})
export class GroupsListComponent implements  OnDestroy, OnInit {

  // Iconos
  faBackspace = faBackspace;
  faEdit = faEdit;
  faTimes = faTimes;

  perfil = 'professor';
  groups = [];
  selectedGroups = [];
  selectAll = false; // per seleccionar tota els grups
  assignaturaId;
  assignatura: Assignatura;
  isLoading = true;
  factorUnitats: number;
  minutsConsumits = 0;
  minutsDisponibles = 0;
  minutsAudio = 20;

  addGroupsFrom: FormGroup;

  paramsSubs: Subscription;
  grupsUpdatedSubs: Subscription;
  grupsChangedSubs: Subscription;


  /** TODO: Falta controlar si se quieren borrar los datos o
   * no de los grupos en caso de ser administrador.
   * En el caso de profe no se puede borrar un grupo con alumnos
   *
   */

  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService,
              private authService: AuthService) { }

  ngOnInit() {

    this.authService.getPerfil().subscribe(
      (data) => {

        this.perfil = data.perfils[0].perfil;

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
      }
    );
/*     if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    } */

    this.grupsUpdatedSubs = this.dbService.grupsUpdated.subscribe(
      (grups) => {
        this.groups = grups;
        this.isLoading = false;


      }
    );

    this.grupsChangedSubs = this.dbService.grupsChanged.subscribe(
      () => {
        this.loadGrups();
      }
    );


    this.dbService.getFactorUnitats().subscribe(
      (resultat) => {
        this.factorUnitats = resultat.json[0].factor;
      }
    );
  }

  ngOnDestroy() {
    if (this.paramsSubs) {
      this.paramsSubs.unsubscribe();
    }

    this.grupsUpdatedSubs.unsubscribe();
    this.grupsChangedSubs.unsubscribe();
  }

  loadGrups() {
    this.isLoading = true;

    this.dbService.getAssignatura(this.assignaturaId).subscribe(
      (assig: Assignatura) => {
        this.assignatura = assig;

        this.dbService.getGrupsAssignatura(this.assignaturaId);
        this.dbService.getMinutsConsumits(this.assignaturaId).subscribe(
          (respostaMinuts) => {

            this.minutsConsumits = respostaMinuts.consulta[0].consumits;
            this.minutsDisponibles = this.assignatura.tamany - this.minutsConsumits;

          });

      }
    );

  }

  onDeleteGroups() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Grups';
    modalRef.componentInstance.missatge = 'Vols esborrar els grups sel·leccionats?';
    modalRef.result.then(
      (resposta) => {

        this.groups = this.groups.filter( grup => {
          return !this.selectedGroups.includes(grup);
        }); // Esborrem de la vista els grups sel·leccionats
        this.selectAll = false;

        this.dbService.deleteGrupsAssignatura(this.selectedGroups, this.assignatura.codi);
        this.selectedGroups = [];
      },
      () => {
        // console.log('Cancelado');
      }
    );
  }

  onCheckGroupClick(groupId: Grup, value: boolean) {

    if (value) {
      this.selectedGroups.push(groupId);
    } else {
      this.selectedGroups.splice(this.selectedGroups.indexOf(groupId), 1);
    }

  }

  onAfegirClick(content) {

    this.dbService.getMinutsConsumits(this.assignaturaId).subscribe(
      (respostaMinuts) => {

        this.minutsConsumits = respostaMinuts.consulta[0].consumits;

        this.addGroupsFrom = new FormGroup({
            quantitat: new FormControl(1, [ Validators.required, Validators.pattern(/^([1-9]\d*)?$/)]),
            quota: new FormControl(1, [ Validators.required, Validators.pattern(/^([1-9]\d*)?$/)]),
            disponibles: new FormControl(this.assignatura.tamany - this.minutsConsumits,
                                         [ Validators.pattern(/^([0-9]\d*)?$/)])
          }
        );

        this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
          (resposta) => {
            if (this.addGroupsFrom.get('disponibles').value >= 0) {
            const quotaEnMg = (resposta.quota * this.factorUnitats).toFixed(0);
            console.log('Vol crear ' + resposta.quantitat + ' grups.');
            console.log('Amb quota ' + resposta.quota + ' minuts. Que son ' + quotaEnMg + 'Mb.');
            this.dbService.addGrupsAssignatura(this.assignatura,
                                               resposta.quantitat,
                                               resposta.quota,
                                               quotaEnMg,
                                               'M' );
            } else {
              console.log('No es poden crear tants grups amb aquesta quota!!!!');

            }
          },
          () => {
            // console.log('Cancelado');
          }
        );
      }

    );
  }

  onDeleteIconClick(grup: Grup) {

    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Grup';
    // modalRef.componentInstance.missatge = 'Vols esborrar el grup ' + this.assignatura.codi + '-g' + grup.ordre + '?';
    modalRef.componentInstance.missatge = 'Vols esborrar el grup ' + grup.nom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar el grup!' + resposta);
        this.dbService.deleteGrupsAssignatura([grup], this.assignatura.codi);
      },
      () => {
        // console.log('Cancelado');
      }
    );

  }

  onBackClick() {
    this.myLocation.back();
  }

  onAddGroupFormChangeQuantitatValues(valorInput: number) {

    const minutsDisponibles = (this.assignatura.tamany - this.minutsConsumits) -
    (this.addGroupsFrom.get('quantitat').value * this.addGroupsFrom.get('quota').value);
    if ( minutsDisponibles < 0) {
      this.addGroupsFrom.patchValue({
        quantitat: valorInput - 1
      });
    } else {
      this.addGroupsFrom.patchValue({
        disponibles: minutsDisponibles
      });
    }

  }

  onAddGroupFormChangeQuotaValues(valorInput: number) {

    const totalMinuts = this.addGroupsFrom.get('quantitat').value * this.addGroupsFrom.get('quota').value;
    const minutsDisponibles = (this.assignatura.tamany - this.minutsConsumits) -
    (this.addGroupsFrom.get('quantitat').value * this.addGroupsFrom.get('quota').value);

    this.minutsAudio = valorInput * 20;

    if (totalMinuts < this.minutsDisponibles) {

      if ( minutsDisponibles < 0) {
        this.addGroupsFrom.patchValue({
          quota: valorInput - 1
        });
      } else {
        this.addGroupsFrom.patchValue({
          disponibles: minutsDisponibles
        });
      }
    }

    if (totalMinuts === this.minutsDisponibles) {
      this.addGroupsFrom.patchValue({
        disponibles: 0
      });
    }

    if (totalMinuts > this.minutsDisponibles) {

      const calQuota = Math.floor(this.minutsDisponibles / this.addGroupsFrom.get('quantitat').value);

      this.addGroupsFrom.patchValue({
        quota: calQuota,
        disponibles: 0
      });
    }

  }

  onSelectAll(selectAllStatus: boolean) {
    if (selectAllStatus) {
      this.selectedGroups = []; // Vaciamos para evitar duplicar entradas
      this.groups.forEach( element => {
        if (element.alumnes === 0) {
          this.selectedGroups.push(element);
        }
      });
    } else {
      this.selectedGroups = [];
    }

    // console.log(this.selectedGroups);

  }

  onEditGrup(grupId: number, nomGrup: string, quotaGrup: number) {
    const disponibles = this.assignatura.tamany - this.minutsConsumits;

    const modalRef = this.modalService.open(GroupEditModalComponent);
    modalRef.componentInstance.nomGrup = nomGrup;
    modalRef.componentInstance.quota = quotaGrup;
    modalRef.componentInstance.grupId = grupId;
    modalRef.componentInstance.minutsDisponibles = disponibles;

    modalRef.result.then(
      (resposta) => {

        const quotaFisica = (resposta.quotaNova * this.factorUnitats).toFixed(0);

        this.dbService.modificarGrupAssignatura(this.assignatura.codi,
          resposta.grupId,
          resposta.nomAnterior,
          resposta.nomNou,
          resposta.quotaNova,
          quotaFisica,
          'M');

      },
      () => {
        // console.log('Cancelado');
      }
    );
  }

}
