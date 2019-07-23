import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from '../shared/mymodalyesno/mymodalyesno.component';
import { Subscription } from 'rxjs';
import { DataBaseService } from '../shared/database.service';
import { Alumne } from '../shared/alumne.model';
import { Grup } from '../shared/grup.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-alumnes-list',
  templateUrl: './alumnes-list.component.html' ,
  styleUrls: ['./alumnes-list.component.css']
})
export class AlumnesListComponent implements OnInit, OnDestroy {
  perfil = 'professor';

  alumnes: Alumne[] = [];

  selectedAlumnes = [];
  selectAllAlumnes = false;

  isLoading = true;

  assignaturaCodi = '';
  grupId;
  grup: Grup;
  paramsSubs: Subscription;
  alumnesUpdatedSubs: Subscription;
  alumnesChangedSubs: Subscription;
  alumnesNamesUpdatedSubs: Subscription;

  // TODO: Controlar si se borran todos los alumnos o si se borra el último
  // para informar que los datos del grupo se borraran OnDeleteAlumnes y onDeleteIconClick


  constructor(private modalService: NgbModal,
              private activatedRoute: ActivatedRoute,
              private myLocation: Location,
              private dbService: DataBaseService,
              private toastr: ToastrService) { }

  ngOnDestroy() {
    this.paramsSubs.unsubscribe();
    this.alumnesChangedSubs.unsubscribe();
    this.alumnesUpdatedSubs.unsubscribe();
    this.alumnesNamesUpdatedSubs.unsubscribe();
  }

  ngOnInit() {
    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    this.alumnesUpdatedSubs = this.dbService.alumnesUpdated.subscribe(
      (alumnes) => {
        this.alumnes = alumnes;
        this.isLoading = false;
        this.selectAllAlumnes = false;
        this.selectedAlumnes = [];

        this.dbService.getAlumnesNames(alumnes);
      }
    );

    this.alumnesChangedSubs = this.dbService.alumnesChanged.subscribe(
      () => {
        this.loadAlumnes();
      }
    );
    this.alumnesNamesUpdatedSubs = this.dbService.alumnesNamesUpdated.subscribe(
      (data: any) => {
        if (data.length > 0) {
          data.forEach(element => {
            this.alumnes[this.alumnes.findIndex(alumne => {
              return element.dn.includes(alumne.niu);
            })].nom = element.cn[0] + ' ' + element.sn[0];
          });
        }
      }
    );

    if (this.activatedRoute.paramMap) {
      this.paramsSubs = this.activatedRoute.paramMap.subscribe(
        (paramMap: ParamMap) => {
          if (paramMap.has('grupid')) {
            this.grupId = paramMap.get('grupid');
            this.loadAlumnes();
          }
        });
    }
  }

  loadAlumnes() {
    this.isLoading = true;

    this.dbService.getGrupInfo(this.grupId).subscribe(
      (grupInfo: any) => {
        this.grup = grupInfo.grup;
        this.assignaturaCodi = grupInfo.assignatura_codi;

        this.dbService.getAlumnesGrup(this.grupId);
        this.selectedAlumnes = [];

      }
    );
  }

  onDeleteIconClick(alumne: Alumne) {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumne';
    let esborrarDades = false;

    if (this.alumnes.length === 1) { // Només queda un alumne, hem d'esborrar dades

      modalRef.componentInstance.missatge = 'Vols esborrar l\'alumne ' + alumne.nom + '?' +
                                            'Atenció! S\'esborraran els fitxers d\'aquest grup!';
      esborrarDades = true;
    } else {
      modalRef.componentInstance.missatge = 'Vols esborrar l\'alumne ' + alumne.nom + '?';
      esborrarDades = false;
    }

    modalRef.result.then(
      (resposta) => {
        this.dbService.deleteAlumnesGrup([alumne],
                                         this.grup.nom,
                                         this.assignaturaCodi, esborrarDades );
        this.selectAllAlumnes = false;
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onCheckAlumneClick(alumne: Alumne, value: boolean) {
    if (value) {
      this.selectedAlumnes.push(alumne);
    } else {
      this.selectedAlumnes.splice(this.selectedAlumnes.indexOf(alumne), 1);
    }

  }

  onAfegirClick(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then(
      (niu) => {
        let duplicat = null;
        duplicat = this.alumnes.find( profe => profe.niu === niu);

        if (duplicat) {
          this.toastr.error('Aquest niu ja està afegit com alumne en aquest grup!!');
        } else {
          const al: Alumne = {
            id: null,
            niu,
            nom: 'Nom no trobat',
            grup_id: this.grupId
          };
          this.dbService.addAlumneGrup(al, this.grup.nom, this.assignaturaCodi);
        }
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onBackClick() {
    this.myLocation.back();
  }

  /**
   * TODO: Falta borrar ficheros del grupo si se borran todos los alumnos
   */

  onDeleteAlumnes() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Alumnes';
    let esborrarDades = false;

    if (this.selectedAlumnes.length === this.alumnes.length) { // Hi ha tots els alumnes seleccionats, hem d'esborrar dades

      modalRef.componentInstance.missatge = 'Vols esborrar els alumnes sel·leccionats?' +
                                            'Atenció! S\'esborraran els fitxers d\'aquest grup!';
      esborrarDades = true;
    } else {
      modalRef.componentInstance.missatge = 'Vols esborrar els alumnes sel·leccionats?';
      esborrarDades = false;
    }
    modalRef.componentInstance.missatge = 'Vols esborrar els alumnes sel·leccionats?';

    modalRef.result.then(
      (resposta) => {

        this.dbService.deleteAlumnesGrup(this.selectedAlumnes,
                                          this.grup.nom,
                                         this.assignaturaCodi, esborrarDades);
        this.selectAllAlumnes = false;
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onSelectAllAlumnes(selectAllStatus: boolean) {
    if (selectAllStatus) {
      this.alumnes.forEach( element => {
          this.selectedAlumnes.push(element);
      });
    } else {
      this.selectedAlumnes = [];
    }

  }

}
