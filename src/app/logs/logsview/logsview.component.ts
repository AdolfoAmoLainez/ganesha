import { Component, OnInit, OnDestroy, Directive, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Log } from 'src/app/shared/log.model';
import { Subscription } from 'rxjs';
import { DataBaseService } from 'src/app/shared/database.service';
import { forEach } from '@angular/router/src/utils/collection';




@Component({
  selector: 'app-logsview',
  templateUrl: './logsview.component.html',
  styleUrls: ['./logsview.component.css']
})
export class LogsviewComponent implements OnInit, OnDestroy {

  dataLog;
  usuari = 'Usuari';
  accio = 'Acció';
  resultat = 'Resultat';

  logs: Log[];
  usuarisArray: string[];
  accionsArray: string[];
  resultatsArray: string[];

  selectedLogParams = '';
  selectedLogResposta = '';
  page = 1;
  pageSize = 5;
  collectionSize = 0;

  logsUpdatedSubs: Subscription;


  constructor(private modalService: NgbModal,
              private dbService: DataBaseService) { }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

  ngOnInit() {

    this.logsUpdatedSubs = this.dbService.logsUpdated.subscribe(
      (resposta) => {

        this.logs = resposta.logs;
        this.collectionSize = resposta.totalRows;

        const usuaris = [];
        const accions = [];
        const resultats = [];

        resposta.usuaris.forEach((usuari) => {
          usuaris.push(usuari.usuari);
        });
        this.usuarisArray = [...usuaris];

        resposta.accions.forEach((accio) => {
          accions.push(accio.accio);
        });
        this.accionsArray = [...accions];

        resposta.resultats.forEach((resultat) => {
          resultats.push(resultat.resultat);
        });
        this.resultatsArray = [...resultats];

      }
    );
  }

  ngOnDestroy() {
    this.logsUpdatedSubs.unsubscribe();
  }


  constructFilterObj() {
    const data = this.dataLog.year + '-' +
    this.dataLog.month + '-' +
    this.dataLog.day;

    const usuari = this.usuari !== 'Usuari' ? this.usuari : '';
    const accio = this.accio !== 'Acció' ? this.accio : '';
    const resultat = this.resultat !== 'Resultat' ? this.resultat : '';
    const limit = this.pageSize;
    const count = (this.page - 1 ) * this.pageSize;

    const filterObj = {
      data,
      usuari,
      accio,
      resultat,
      limit,
      count
    };

    console.log(filterObj);


    return filterObj;
  }

  onDateSelected() {

    this.dbService.getLogs(this.constructFilterObj());

  }

/*   onSort(event) {
    console.log("Sort");

  } */

  onMouseEnter(log: Log) {
    // console.log(log);

  }

  onMouseOut() {
    // console.log('Dismiss!');

  }

  onFilterChange() {
    console.log("Filter Change!");
    this.dbService.getLogs(this.constructFilterObj());
  }

  onUsuariFilterClick() {
    if (this.usuari !== 'Usuari') {
      this.usuari = 'Usuari';
      this.onFilterChange();
    }
  }

  onAccioFilterClick() {
    if (this.accio !== 'Acció') {
      this.accio = 'Acció';
      this.onFilterChange();
    }
  }

  onResultatFilterClick() {
    if (this.resultat !== 'Resultat') {
      this.resultat = 'Resultat';
      this.onFilterChange();
    }
  }



  logModalView(content, params: string, resposta: string) {
    this.selectedLogParams = JSON.parse(params);
    this.selectedLogResposta = resposta;

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }

  pageChanged(page: number): void {

    this.page = page;
    this.onFilterChange();
  }
}

