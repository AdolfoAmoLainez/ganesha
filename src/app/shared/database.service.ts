import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';

import { Assignatura } from '../shared/assignatura.model';
import { Subject } from 'rxjs';
import { Unitat } from './unitat.model';
import { Professor } from './professor.model';
import { map } from 'rxjs/operators';
import { Grup } from './grup.model';
import { Alumne } from './alumne.model';
import {environment} from '../../environments/environment';

@Injectable()
export class DataBaseService {
  assignatures = [
    {
      id: 1,
      codi: '11223311',
      nom: 'Assignatura 01'
    },
    {
      id: 2,
      codi: '11223322',
      nom: 'Assignatura 02'
    },
    {
      id: 3,
      codi: '11223333',
      nom: 'Assignatura 03'
    }
  ];

  assignaturaChanged = new Subject <Assignatura>();
  assignaturesUpdated = new Subject <Assignatura []>();
  grupsUpdated = new Subject();
  alumnesUpdated = new Subject();
  profesUpdated = new Subject();

  constructor(private http: HttpClient) {}


  getLvmInfo() {
    return this.http.get<{codi: number, message: string, json: any}>(environment.selfApiUrl + 'getlvminfo');
  }

  getAssignatures() {
    return this.http.get<{assignatures: Assignatura[]}>(environment.apiCrudUrl + 'assignatures').subscribe(
      (data: any) => {
        // console.log(data);

        this.assignaturesUpdated.next(data.json);
      }
    );
    // return this.assignatures;
  }

  getAssignatura(id: string) {
    return this.http.get<{result: string, json: Assignatura[], length: number}>(environment.apiCrudUrl + 'assignatures/' + id).pipe(
      map(
        (data) => {
          return data.json[0];
        }
      )
    );
  }

  getNomAssignatura(id: string) {
    return this.http.get<{nom: string}>(environment.apiCrudUrl + 'assignatures/' + id ).pipe(
      map(
        (data: any) => {
          return data.json[0].nom;
        }
      )
    );
  }

  addAssignatura(assignatura: Assignatura) {
    return this.http.post(environment.selfApiUrl + 'add_assignatura', assignatura).subscribe(
      (data) => {
        // console.log(data);
        this.getAssignatures();
      }
    );
  }

  updateAssignatura(assignatura: Assignatura) {
    return this.http.put(environment.apiCrudUrl + 'assignatures/' + assignatura.id, assignatura).subscribe(
      (data: any) => {
        this.assignaturaChanged.next(assignatura);
      }
    );
  }

  getUnitatsDisponibles() {
    return this.http.get<{unitats: Unitat[]}>(environment.apiCrudUrl + 'unitats?disponible[LIKE]=1');
  }

  getProfessorsAssignatura(assignaturaId: string) {
    return this.http.get<{professors: Professor[]}> (environment.apiCrudUrl + 'professors?assignatura_id[LIKE]=' + assignaturaId);
  }

  deleteProfessorAssignatura(profeId: number) {
    return this.http.delete(environment.apiCrudUrl + 'professors/' + profeId);
  }

  deleteProfessorsAssignatura(profeList: string) {
    const query = {
      query: 'DELETE FROM professors WHERE id IN (' + profeList + ');'
    };

    return this.http.post(environment.apiCustomUrl + '', query);
  }

  addProfessorAssignatura(professor: Professor, assignatura: Assignatura) {
    const profObj = {
      assignatura,
      professor
    };
    return this.http.post(environment.selfApiUrl + 'add_professor_assignatura', profObj).subscribe(
      (response) => {
        this.profesUpdated.next();
      }
    );
  }

  /** GRUPS */

  addGrupsAssignatura(assignatura: Assignatura, quantitat: number, quota: string) {
    const obj = {
      assignatura,
      quantitat,
      quota
    };

    return this.http.post(environment.selfApiUrl + 'crea_grups', obj).subscribe(
      (response) => {
        console.log(response);

        this.grupsUpdated.next();
      }
    );
  }

  deleteGrupsAssignatura(grups: number[]) {

    return this.http.post(environment.selfApiUrl + 'esborra_grups', grups).subscribe(
      (response) => {
        console.log(response);

        this.grupsUpdated.next();
      }
    );

  }

  getGrupsAssignatura(assignaturaId: string) {
    return this.http.get<{grups: Grup[]}> (environment.apiCrudUrl + 'grups?assignatura_id[LIKE]=' + assignaturaId);
  }

  getGrupInfo(id: string) {
    const query = {
      query: 'SELECT assignatures.codi, grups.* FROM `grups` INNER JOIN assignatures on assignatures.id = grups.assignatura_id WHERE grups.id=' + id
    };

    return this.http.post<{result: string, json: any, length: number}>(environment.apiCustomUrl + '', query).pipe(
      map(
        (data: any) => {
          const grup: Grup = {
            id: data.json[0].id,
            assignatura_id: data.json[0].assignatura_id,
            quota: data.json[0].quota,
            ordre: data.json[0].ordre
          }
          return {assignatura_codi: data.json[0].codi, grup: grup};
        }
      )
    );
  }

  getNomGrup(idGrup) {
    return this.http.get<{nom: string}>(environment.apiCrudUrl + 'grups/' + idGrup ).pipe(
      map(
        (data: any) => {
          return data.json[0].nom;
        }
      )
    );
  }

  getAlumnesGrup(grupId: string) {
    return this.http.get<{grups: Grup[]}> (environment.apiCrudUrl + 'alumnes?grup_id[LIKE]=' + grupId);
  }

  addAlumneGrup(alumne: Alumne) {
      return this.http.post<{result: string, json: any, length: number}>(environment.selfApiUrl + 'add_alumne_grup', alumne).subscribe(
        (data) => {
          this.alumnesUpdated.next();
        }
      );
  }

  deleteAlumnesGrup(alumnes: Alumne[]) {
    return this.http.post<{result: string, json: any, length: number}>
      (environment.selfApiUrl + 'delete_alumnes_grup', alumnes).subscribe(
        (data) => {
          this.alumnesUpdated.next();
        }
      );
  }

  // deleteAlumnesGrup(alumneList: string) {
  //   const query = {
  //     query: 'DELETE FROM alumnes WHERE id IN (' + alumneList + ');'
  //   };

  //   return this.http.post(environments.selfApiCustom + '', query);
  // }

  getFactorUnitats() {
    return this.http.get<{result: string, json: any, length: number}> (environment.apiCrudUrl + 'factorunitats/1');
  }

}
