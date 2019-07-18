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
import { Router } from '@angular/router';
import { stringify } from '@angular/core/src/render3/util';
import { Usuari } from './usuari.model';
import { Perfil } from './perfil.model';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MymodalwaitComponent } from './mymodalwait/mymodalwait.component';

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
  grupsUpdated = new Subject<Grup[]>();
  grupsChanged = new Subject();
  alumnesUpdated = new Subject<Alumne[]>();
  alumnesChanged = new Subject();
  alumnesNamesUpdated = new Subject();
  profesUpdated = new Subject<Professor[]>();
  profesChanged = new Subject();
  usuarisUpdated = new Subject<Usuari[]>();
  usuarisChanged = new Subject();
  perfilsUpdated = new Subject<Perfil[]>();


  constructor(private http: HttpClient,
              private router: Router,
              private toastr: ToastrService,
              private modalService: NgbModal) {}


  getLvmInfo() {
    return this.http.get<{codi: number, message: string, json: any}>(environment.selfApiUrl + 'getlvminfo');
  }

  getAssignatures() {
    return this.http.get<{assignatures: Assignatura[]}>(environment.apiCrudUrl + 'assignatures?' + '_order[codi]=ASC').subscribe(
      (data: any) => {

        this.assignaturesUpdated.next(data.json);
      }
    );

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
    return this.http.post<{message: string, assignaturaId: number}>
      (environment.selfApiUrl + 'add_assignatura', assignatura).subscribe(
      (data) => {
        console.log(data);
        this.toastr.success(data.message);
        this.getAssignatures();
        this.router.navigate(['/', 'adm', 'assignatura', data.assignaturaId, 'professors']);
      },
      (err) => {
        console.log(err);
        this.toastr.error(err.error.message);
      }
    );
  }

  deleteAssignatura(assignatura: Assignatura) {

    const modalRef = this.modalService.open(MymodalwaitComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.titol = 'Operació en procés';
    modalRef.componentInstance.missatge = 'Esperi mentre esborrem l\'assignatura. Aquesta acció pot trigar uns minuts....';

    return this.http.post<{message: string}>(environment.selfApiUrl + 'delete_assignatura', assignatura).subscribe(
      (data) => {
        console.log(data);
        this.toastr.success(data.message);
        this.getAssignatures();
        this.router.navigate(['/', 'adm']);
        modalRef.dismiss();
      },
      (err) => {
        console.log(err);
        this.toastr.error(err.error.message);
        this.getAssignatures();
        this.router.navigate(['/', 'adm']);
        modalRef.dismiss();
      }
    );
  }

  getMinutsConsumits(id: string) {
    const peticio = {
      id
    };
    return this.http.post<{message: string, consulta: any}>(environment.selfApiUrl + 'get_minuts_consumits', peticio);
  }

  updateAssignatura(assignatura: Assignatura) {
    return this.http.put(environment.apiCrudUrl + 'assignatures/' + assignatura.id, assignatura).subscribe(
      (data: any) => {
        this.assignaturaChanged.next(assignatura);
        this.toastr.success("Assignatura modificada correctament!");
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  getUnitatsDisponibles() {
    return this.http.get<{unitats: Unitat[]}>(environment.apiCrudUrl + 'unitats?disponible[LIKE]=1');
  }

  getProfessorsAssignatura(assignaturaId: string) {
    return this.http.get<{result: string, json: Professor[], length: number}>
      (environment.apiCrudUrl + 'professors?assignatura_id[LIKE]=' + assignaturaId + '&_order[niu]=ASC').subscribe(
        (data) => {
          console.log(data);

          this.profesUpdated.next([...data.json]);
        }
      );
  }

  deleteProfessorsAssignatura(profes: Professor[], assigCodi: string) {
    const obj = {
      profes,
      assigCodi
    };

    const modalRef = this.modalService.open(MymodalwaitComponent,{backdrop: 'static', keyboard: false});
    modalRef.componentInstance.titol = 'Operació en procés';
    modalRef.componentInstance.missatge = 'Esperi mentre esborrem els professors. Aquesta acció pot trigar uns minuts....';

    return this.http.post<{problemes: number, profes: any}>
      (environment.selfApiUrl + 'delete_professors_assignatura', obj).subscribe(
        (data) => {

          if (data.problemes === 0) {
            this.toastr.success(data.profes[0].message);
          } else {
            data.profes.forEach(profe => {
              this.toastr.error(profe.message);
            });
          }
          this.profesChanged.next();
          modalRef.dismiss();

        },
        (err) => {
          if (err.error.problemes === -1) {
            this.toastr.error(err.error.profes[0].message);
          } else {
            err.error.profes.forEach(profe => {
              this.toastr.error(profe.message + ' ' + profe.json.nomgrup);
            });
          }
          this.profesChanged.next();
          modalRef.dismiss();
        }
        );
  }

  addProfessorAssignatura(professor: Professor, assignaturaCodi: string) {
    const profObj = {
      assignaturaCodi,
      professor
    };
    return this.http.post<{message: string}>(environment.selfApiUrl + 'add_professor_assignatura', profObj).subscribe(
      (response) => {

        this.toastr.success(response.message);
        this.profesChanged.next();
      },
      (err) => {
        this.toastr.error(err.error.message);
        this.profesChanged.next();
      }
    );
  }

  /** GRUPS */

  addGrupsAssignatura(assignatura: Assignatura, quantitat: number, quotaMin: string, quotaGb: string) {
    const obj = {
      assignatura,
      quantitat,
      quotaMin,
      quotaGb
    };

    return this.http.post<{problemes: number, grups: any}>(environment.selfApiUrl + 'add_grups', obj).subscribe(
      (response) => {
        console.log(response);
        if (response.problemes === 0) {
          this.toastr.success(response.grups[0].message);
        } else {
          response.grups.forEach(grup => {
            this.toastr.error(grup.message);
          });
        }
        this.grupsChanged.next();
      },
      (err) => {

        if (err.error.problemes === -1) {
          this.toastr.error(err.error.grups[0].message);
        } else {
          err.error.grups.forEach(grup => {
            console.log(grup);
            this.toastr.error(grup.message + ' ' + grup.json.nomgrup);
          });
        }
        this.grupsChanged.next();
      }
    );
  }

  deleteGrupsAssignatura(grups: Grup[], assigCodi: string) {

    const obj = {
      grups,
      assigCodi
    };
    const modalRef = this.modalService.open(MymodalwaitComponent,{backdrop: 'static', keyboard: false});
    modalRef.componentInstance.titol = 'Operació en procés';
    modalRef.componentInstance.missatge = 'Esperi mentre esborrem els grups. Aquesta acció pot trigar uns minuts....';

    return this.http.post<{problemes: number, grups: any}>(environment.selfApiUrl + 'delete_grups', obj).subscribe(
      (response) => {

        if (response.problemes === 0) {
          this.toastr.success(response.grups[0].message);
        } else {
          response.grups.forEach(grup => {
            this.toastr.error(grup.message);
          });
        }
        this.grupsChanged.next();
        modalRef.dismiss();
      },
      (err) => {
        if (err.error.problemes === -1) {
          this.toastr.error(err.error.grups[0].message);
        } else {
          err.error.grups.forEach(grup => {
            this.toastr.error(grup.message + ' ' + grup.json.nomgrup);
          });
        }
        this.grupsChanged.next();
        modalRef.dismiss();
      }
    );

  }

  getGrupsAssignatura(assignaturaId: string) {
    const obj = {
      id: assignaturaId
    };

    return this.http.post<{message: string, consulta: Grup[]}>
      (environment.selfApiUrl + 'get_grups_assignatura', obj).subscribe(
      (response) => {
        this.grupsUpdated.next(...[response.consulta]);
      },
      (err) => {
        this.toastr.error('No s\'ha pogut consultar els grups de l\'assignatura!');
      }
    );
  }

  getGrupInfo(grup_id: string) {
    const obj = {
      grup_id
    };

    return this.http.post<[{id: number, ordre: number, quota: number, assignatura_id: number, codi: string}]>
      (environment.selfApiUrl + 'get_grup_info', obj).pipe(
      map(
        (data) => {
          const grup: Grup = {
            id: data[0].id,
            assignatura_id: data[0].assignatura_id,
            quota: data[0].quota,
            ordre: data[0].ordre,
            alumnes:  0
          }
          return {assignatura_codi: data[0].codi, grup: grup};
        },
        (err) => {
          this.toastr.error('No s\'ha pogut consultar la informació del grup!');
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
    return this.http.get<{result: string, json: any, length: number}>
      (environment.apiCrudUrl + 'alumnes?grup_id[LIKE]=' + grupId + '&_order[niu]=ASC').subscribe(
      (data) => {
        this.alumnesUpdated.next([...data.json]);
      }
    )
  }

  addAlumneGrup(alumne: Alumne, grupName: string, assigCodi: string) {
    const obj = {
      alumne,
      grupName,
      assigCodi
    };
    console.log(obj);

    return this.http.post<{message: string}>
      (environment.selfApiUrl + 'add_alumne_grup', obj).subscribe(
      (response) => {
        this.toastr.success(response.message);
        this.alumnesChanged.next();
        this.grupsChanged.next();
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }

  deleteAlumnesGrup(alumnes: Alumne[], grupName: string, assigCodi: string, esborrarDades: boolean) {
    const obj = {
      alumnes,
      grupName,
      assigCodi,
      esborrarDades
    };

    const modalRef = this.modalService.open(MymodalwaitComponent,{backdrop: 'static', keyboard: false});
    modalRef.componentInstance.titol = 'Operació en procés';
    modalRef.componentInstance.missatge = 'Esperi mentre esborrem els alumnes. Aquesta acció pot trigar uns minuts....';

    return this.http.post<{problemes: number, alumnes: any}>
      (environment.selfApiUrl + 'delete_alumnes_grup', obj).subscribe(
        (response) => {

          if (response.problemes === 0) {
            this.toastr.success(response.alumnes[0].message);
          } else {
            response.alumnes.forEach(alumne => {
              this.toastr.error(alumne.message);
            });
          }
          this.alumnesChanged.next();
          this.grupsChanged.next();
          modalRef.dismiss();
        },
        (err) => {
          if (err.error.problemes === -1) {
            this.toastr.error(err.error.alumnes[0].message);
          } else {
            err.error.alumnes.forEach(alumne => {
              this.toastr.error(alumne.message + ' ' + alumne.json.grupo_asignatura);
            });
          }
          this.alumnesChanged.next();
          this.grupsChanged.next();
          modalRef.dismiss();
        }
      );
  }

  getFactorUnitats() {
    return this.http.get<{result: string, json: any, length: number}> (environment.apiCrudUrl + 'factorunitats/1');
  }

  getUsuaris() {
    return this.http.get<{result: string, json: any, length: number}>(environment.apiCrudUrl + 'usuaris').subscribe(
      (data) => {
        this.usuarisUpdated.next(data.json);
      }
    );
  }

  addUsuari() {
    return this.http.get<{result: string, json: any, length: number}>(environment.selfApiUrl + 'add_usuari').subscribe(
      (data) => {
        this.usuarisChanged.next();
      }
    );
  }

  deleteUsuari(usuariId: number) {
    return this.http.delete<{result: string, json: any, length: number}>
      (environment.apiCrudUrl + 'usuaris/' + usuariId).subscribe(
      (data) => {
        this.usuarisChanged.next();
      }
    )
  }

  modificarUsuari(usuari: Usuari) {
    return this.http.put(environment.apiCrudUrl + 'usuaris/' + usuari.id, usuari).subscribe(
      (data: any) => {
        this.usuarisChanged.next();
      }
    );
  }

  getPerfils() {
    return this.http.get<{result: string, json: any, length: number}>(environment.apiCrudUrl + 'perfils').subscribe(
      (data) => {
        this.perfilsUpdated.next(data.json);
      }
    );
  }

  validaUsuari(username: string, passwd: string) {
    const obj = {
      username,
      passwd
    };

    return this.http.post<{status: string , message: string, perfils: [{perfil: string, id: number}]}>
      (environment.selfApiUrl + 'valida_usuari', obj);
  }

  getPerfil(username: string) {
    const obj = {
      username
    };

    return this.http.post<{status: string , message: string, perfils: [{perfil: string}]}>
      (environment.selfApiUrl + 'get_perfil_usuari', obj);
  }

  getAlumnesNames(alumnes: Alumne[]) {

    const obj = {
      alumnes
    };

    return this.http.post(environment.selfApiUrl + 'get_alumnes_names', obj).subscribe(
      (data: any[]) => {
        this.alumnesNamesUpdated.next(data);
      }
    );
  }
}
