import { Component, OnInit, OnDestroy } from '@angular/core';
import { Usuari } from 'src/app/shared/usuari.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from 'src/app/shared/mymodalyesno/mymodalyesno.component';
import { DataBaseService } from 'src/app/shared/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-usuaris-list',
  templateUrl: './usuaris-list.component.html',
  styleUrls: ['./usuaris-list.component.css']
})
export class UsuarisListComponent implements OnInit, OnDestroy {

  usuaris: Usuari[] = [{
    id: 1,
    niu: '2040206',
    perfil_id: 1
  },
  {
    id: 2,
    niu: '2040206',
    perfil_id: 2
  },
  {
    id: 3,
    niu: '2040206',
    perfil_id: 1
  }];

  perfils = [
    {
      id: 1,
      perfil: 'adm'
    },
    {
      id: 2,
      perfil: 'profe'
    }
  ];

  usuarisUpdatedSubs: Subscription;
  usuarisChangedSubs: Subscription;

  constructor(private modalService: NgbModal,
              private dbService: DataBaseService) { }


  /**
   * TODO: Falta isLoading
   */
  ngOnInit() {
    this.usuarisUpdatedSubs = this.dbService.usuarisUpdated.subscribe(
      (usuaris) => {
        this.usuaris = usuaris;
      }
    );

    this.usuarisChangedSubs = this.dbService.usuarisChanged.subscribe(
      () => {
        this.dbService.getUsuaris();
      }
    );

    this.dbService.getUsuaris();
  }

  ngOnDestroy() {
    this.usuarisUpdatedSubs.unsubscribe();
    this.usuarisChangedSubs.unsubscribe();
  }

  onGuardar(usuari: Usuari) {
    console.log(usuari);
    this.dbService.modificarUsuari(usuari);
  }

  onEsborrar(usuari: Usuari) {
    console.log(usuari);
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Usuari';
    modalRef.componentInstance.missatge = 'Vols esborrar l\'usuari \'' + usuari.niu + '\'?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar l\'usuari.');
        this.dbService.deleteUsuari(usuari.id);
      },
      () => {
        console.log('Cancelado');
      }
    );

  }

  onAfegir() {
    this.dbService.addUsuari();
  }



}
