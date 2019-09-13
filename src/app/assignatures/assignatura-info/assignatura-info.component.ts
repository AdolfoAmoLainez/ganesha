import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Assignatura } from 'src/app/shared/assignatura.model';
import { DataBaseService } from 'src/app/shared/database.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Unitat } from 'src/app/shared/unitat.model';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MymodalyesnoComponent } from 'src/app/shared/mymodalyesno/mymodalyesno.component';

@Component({
  selector: 'app-assignatura-info',
  templateUrl: './assignatura-info.component.html',
  styleUrls: ['./assignatura-info.component.css']
})
export class AssignaturaInfoComponent implements OnInit, OnDestroy {

  perfil = 'adm';
  assignatura: Assignatura;
  //unitatsDisponibles: Unitat[];
  assignaturaForm: FormGroup;
  assignaturaId;
  assignaturesUpdatedSubs: Subscription;
  editMode = false;
  lvmInfo = {
    volname: '',
    espacio_total: '',
    espacio_usado: '',
    espacio_libre: ''
  };

  factorUnitats = 1;

  constructor(private activatedRoute: ActivatedRoute,
              private dbService: DataBaseService,
              private modalService: NgbModal) {}

  ngOnInit() {
    // this.assignatura.codi = "1212"

    // El codi d'assignatura ha de començar per a i no pot tenir caracters especials
    this.assignaturaForm = new FormGroup({
      id: new FormControl(''),
      codi: new FormControl('', [Validators.required, , Validators.pattern(/^[a,m][^A-Z?¿*!|'\^\(\){}@\"$%&\/\\`´\[\]\+]+$/)]),
      nom: new FormControl('', [Validators.required]),
      tamany: new FormControl('', [Validators.required, Validators.min(1)]),
      tamanygb: new FormControl(0),
      validapgina: new FormControl(false)
    });


    this.dbService.getFactorUnitats().subscribe(
      (resultat) => {
        this.factorUnitats = resultat.json[0].factor;
      }
    );

    if (this.activatedRoute.parent.snapshot.data.perfil) {
      this.perfil = this.activatedRoute.parent.snapshot.data.perfil;
    }

    if (this.activatedRoute.parent.paramMap) {
      this.activatedRoute.parent.paramMap.subscribe(
        (paramMap: ParamMap) => {

          // Comentat per la posibilitat de no fer servir diferents lletres d'unitats
          // this.dbService.getUnitatsDisponibles().subscribe(
          //   (data: any) => {
          //     this.unitatsDisponibles = data.json;
          //   }
          // );

          // console.log(paramMap);
          if (paramMap.has('assignaturaid')) {
            this.editMode = true;
            this.assignaturaId = paramMap.get('assignaturaid');
            this.dbService.getAssignatura(this.assignaturaId).subscribe(
              (assignatura: Assignatura) => {
                //const assignatura = result.json[0];
                // console.log(assignatura);
                this.assignatura = assignatura;
                this.assignaturaForm.patchValue({
                  id: assignatura.id,
                  codi: assignatura.codi,
                  nom: assignatura.nom,
                  tamany: assignatura.tamany,
                  validapgina: assignatura.validapgina,
                  //unitat_id: assignatura.unitat_id,
                  //unitatstamany: assignatura.unitatstamany,
                  // quota: assignatura.quota,
                  // unitatsquota: assignatura.unitatsquota
                });
              }
            );
          }
        }
      );
    }

    this.dbService.getLvmInfo().subscribe(
      (data) => {
        this.lvmInfo = data.json[0];
      }
    );

    /* Cada vegada que s'afegeix una assignatura actualitzem les dades LVM */
    this.assignaturesUpdatedSubs = this.dbService.assignaturesUpdated.subscribe(
      (data) => {
        this.dbService.getLvmInfo().subscribe(
          (info) => {

            this.lvmInfo = info.json[0];
          }
        );
      }
    );
  }

  ngOnDestroy() {
    this.assignaturesUpdatedSubs.unsubscribe();
  }

  onAddAssignatura() {

    this.assignaturaForm.patchValue({
      tamanygb: parseInt((this.assignaturaForm.get('tamany').value * this.factorUnitats).toFixed(0))
    });
    //console.log(this.assignaturaForm.value);
    this.dbService.addAssignatura(this.assignaturaForm.value);

    this.assignaturaForm.reset();
  }

  // TODO: Controlar si ha cambiado el tamaño porque hay que
  // hacer cambios en el SO. Con el pristine y el touched
  onUpdateAssignatura() {
    this.dbService.updateAssignatura(this.assignaturaForm.value);
  }

  onDeleteAssignatura() {
    const modalRef = this.modalService.open(MymodalyesnoComponent);
    modalRef.componentInstance.titol = 'Esborrar Assignatura';
    modalRef.componentInstance.missatge = 'Vols esborrar l\'assignatura ' + this.assignatura.nom + '?';
    modalRef.result.then(
      (resposta) => {
        console.log('Vol esborrar l\'assignatura');
        this.dbService.deleteAssignatura(this.assignatura);
      },
      () => {
        console.log('Cancelado');
      }
    );
  }

  onChangeTamanyValues(valorInput: number) {

    if (valorInput < 0 ) {
      this.assignaturaForm.patchValue({
        tamany: 0
      });
    }

  }

}
