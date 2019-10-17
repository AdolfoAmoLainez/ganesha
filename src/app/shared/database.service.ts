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
import { Usuari } from './usuari.model';
import { Perfil } from './perfil.model';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MymodalwaitComponent } from './mymodalwait/mymodalwait.component';
import { AuthService } from '../auth/auth.service';
import { Log } from './log.model';

@Injectable()
export class DataBaseService {

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
  logsUpdated = new Subject<{totalRows: number,
                              logs: Log[],
                              usuaris: [{usuari: string}],
                              accions: [{accio: string}],
                              resultats: [{resultat: string}]
                            }>();


  constructor(private http: HttpClient,
              private router: Router,
              private toastr: ToastrService,
              private modalService: NgbModal,
              private authService: AuthService) {}


  getLvmInfo() {
    return this.http.get<{codi: number, message: string, json: any}>(environment.selfApiUrl + 'getlvminfo');
  }

  getAssignatures() {
    return this.http.get<{result: string, json: any, length: number}>
      (environment.apiCrudUrl + 'assignatures?' + '_order[codi]=ASC').subscribe(
      (data) => {

        this.assignaturesUpdated.next(data.json);
      }
    );

  }

  getAssignaturesProfessor(username: string) {
    const obj = {
      username
    };
    return this.http.post<Assignatura[]>
      (environment.selfApiUrl + 'get_assignatures_profe', obj).subscribe(
      (data) => {
        this.assignaturesUpdated.next(data);
      },
      (err) => {
        this.toastr.error(err.error.message);
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
    const obj = {
      username: this.authService.getUsername(),
      assignatura
    };

    return this.http.post<{message: string, assignaturaId: number}>
      (environment.selfApiUrl + 'add_assignatura', obj).subscribe(
      (data) => {

        this.toastr.success(data.message);
        this.getAssignatures();
        this.router.navigate(['/', 'adm', 'assignatura', data.assignaturaId, 'professors']);
      },
      (err) => {

        this.toastr.error(err.error.message);
      }
    );
  }

  deleteAssignatura(assignatura: Assignatura) {

    const obj = {
      username: this.authService.getUsername(),
      assignatura
    };

    const modalRef = this.modalService.open(MymodalwaitComponent, {backdrop: 'static', keyboard: false});
    modalRef.componentInstance.titol = 'Operació en procés';
    modalRef.componentInstance.missatge = 'Esperi mentre esborrem l\'assignatura. Aquesta acció pot trigar uns minuts....';

    return this.http.post<{message: string}>(environment.selfApiUrl + 'delete_assignatura', obj).subscribe(
      (data) => {

        this.toastr.success(data.message);
        this.getAssignatures();
        this.router.navigate(['/', 'adm']);
        modalRef.dismiss();
      },
      (err) => {

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


  /**
   * TODO: Falta verificar què fem si canvia la quota!
   * @param assignatura
   */

  updateAssignatura(assignatura: Assignatura) {
    return this.http.put(environment.apiCrudUrl + 'assignatures/' + assignatura.id, assignatura).subscribe(
      (data: any) => {
        this.assignaturaChanged.next(assignatura);
        this.toastr.success('Assignatura modificada correctament!');
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

          this.profesUpdated.next(data.json);
        }
      );
  }

  deleteProfessorsAssignatura(profes: Professor[], assigCodi: string) {
    const obj = {
      username: this.authService.getUsername(),
      profes,
      assigCodi
    };

    const modalRef = this.modalService.open(MymodalwaitComponent, {backdrop: 'static', keyboard: false});
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
      username: this.authService.getUsername(),
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

  addGrupsAssignatura(assignatura: Assignatura, quantitat: number, quotaMin: string, quotaFisica: string, unitatsQuota: string) {
    const obj = {
      username: this.authService.getUsername(),
      assignatura,
      quantitat,
      quotaMin,
      quotaFisica,
      unitatsQuota
    };

    return this.http.post<{problemes: number, grups: any}>(environment.selfApiUrl + 'add_grups', obj).subscribe(
      (response) => {

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
            this.toastr.error(grup.message + ' ' + grup.json.nomgrup);
          });
        }
        this.grupsChanged.next();
      }
    );
  }

  modificarGrupAssignatura(nomAssignatura: string, grupId: number, nomAnterior: string,
                           nomNou: string, quotaMinuts: string, quotaFisica: string, unitatsQuota: string) {

    const obj = {
      username: this.authService.getUsername(),
      nomAssignatura,
      grupId,
      nomAnterior,
      nomNou,
      quotaMinuts,
      quotaFisica,
      unitatsQuota
    };

    return this.http.post<{message: string}>(environment.selfApiUrl + 'mod_grup', obj).subscribe(
      (response) => {
        this.toastr.success(response.message);
        this.grupsChanged.next();
      },
      (err) => {

        this.toastr.error(err.error.message);
        this.grupsChanged.next();
      }
    );

  }

  deleteGrupsAssignatura(grups: Grup[], assigCodi: string) {

    const obj = {
      username: this.authService.getUsername(),
      grups,
      assigCodi
    };
    const modalRef = this.modalService.open(MymodalwaitComponent, {backdrop: 'static', keyboard: false});
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
        this.grupsUpdated.next(response.consulta);
      },
      (err) => {
        this.toastr.error('No s\'ha pogut consultar els grups de l\'assignatura!');
      }
    );
  }

  getGrupInfo(grupId: string) {
    const obj = {
      grup_id: grupId
    };

    return this.http.post<[{id: number, ordre: number, quota: number, assignatura_id: number, codi: string, nom: string}]>
      (environment.selfApiUrl + 'get_grup_info', obj).pipe(
      map(
        (data) => {
          const grup: Grup = {
            id: data[0].id,
            assignatura_id: data[0].assignatura_id,
            nom: data[0].nom,
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
        this.alumnesUpdated.next(data.json);
      }
    );
  }

  addAlumneGrup(alumne: Alumne, grupName: string, assigCodi: string) {
    const obj = {
      username: this.authService.getUsername(),
      alumne,
      grupName,
      assigCodi
    };

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
      username: this.authService.getUsername(),
      alumnes,
      grupName,
      assigCodi,
      esborrarDades
    };

    const modalRef = this.modalService.open(MymodalwaitComponent, {backdrop: 'static', keyboard: false});
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
    );
  }

  modificarUsuari(usuari: Usuari) {
    return this.http.put(environment.apiCrudUrl + 'usuaris/' + usuari.id, usuari).subscribe(
      (data: any) => {
        this.usuarisChanged.next();
        this.toastr.success('Usuari guardat correctament');
      },
      (err) => {
        this.toastr.error('Ha hagut un error al guardar l\'usuari');
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

  getLogs(filterObj: any) {

    return this.http.post<{totalRows: number,
                           logs: Log[],
                           usuaris: [{usuari: string}],
                           accions: [{accio: string}],
                           resultats: [{resultat: string}]
                          }>
    (environment.selfApiUrl + 'get_logs', filterObj).subscribe(
      (respuesta) => {
        this.logsUpdated.next(respuesta);
      },
      (err) => {
        this.toastr.error(err.error.message);
      }
    );
  }


  validarGroupNameNotTaken(nomgrup: string) {

    const obj = {
      nomgrup
    };

    return this.http.post<{nomgrupexisteix: boolean}>(environment.selfApiUrl + 'testnamenottaken', obj);

  }

}
