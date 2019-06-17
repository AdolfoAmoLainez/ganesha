import { Component, OnInit, OnDestroy } from '@angular/core';
import { Usuari } from 'src/app/shared/usuari.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from 'src/app/shared/mymodalyesno/mymodalyesno.component';
import { DataBaseService } from 'src/app/shared/database.service';
import { Subscription } from 'rxjs';
import { Perfil } from 'src/app/shared/perfil.model';

@Component({
  selector: 'app-usuaris-list',
  templateUrl: './usuaris-list.component.html',
  styleUrls: ['./usuaris-list.component.css']
})
export class UsuarisListComponent implements OnInit, OnDestroy {

  perfils: Perfil[];
  usuaris: Usuari[];
  isLoading = true;

  usuarisUpdatedSubs: Subscription;
  usuarisChangedSubs: Subscription;
  perfilsUpdatedSubs: Subscription;

  constructor(private modalService: NgbModal,
              private dbService: DataBaseService) { }

  ngOnInit() {
    this.usuarisUpdatedSubs = this.dbService.usuarisUpdated.subscribe(
      (usuaris) => {
        this.usuaris = usuaris;

        this.perfilsUpdatedSubs = this.dbService.perfilsUpdated.subscribe(
          (perfils) => {
            this.perfils = perfils;
            this.isLoading = false;
          }
        )
      }
    );

    this.usuarisChangedSubs = this.dbService.usuarisChanged.subscribe(
      () => {
        this.dbService.getUsuaris();
        this.isLoading = true;
      }
    );

    this.dbService.getUsuaris();
    this.dbService.getPerfils();
  }

  ngOnDestroy() {
    this.usuarisUpdatedSubs.unsubscribe();
    this.usuarisChangedSubs.unsubscribe();
    this.perfilsUpdatedSubs.unsubscribe();
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
        this.isLoading = true;
      },
      () => {
        console.log('Cancelado');
      }
    );

  }

  onAfegir() {
    this.dbService.addUsuari();
    this.isLoading = true;
  }



}
