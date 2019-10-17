import { Component, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Assignatura } from 'src/app/shared/assignatura.model';
import { MymodalyesnoComponent } from 'src/app/shared/mymodalyesno/mymodalyesno.component';
import { DataBaseService } from 'src/app/shared/database.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit-modal.component.html',
  styleUrls: ['./group-edit-modal.component.css']
})
export class GroupEditModalComponent implements OnInit {

  public grupId: string;
  public assignatura: Assignatura;
  public nomGrup: string;
  public minutsDisponibles: number;
  public quota: number;

  editForm: FormGroup;
  topeQuota: number;
  canEditName = false;
  nomEditGrup = '';

  constructor(public activeModal: NgbActiveModal,
              private modalService: NgbModal,
              private db: DataBaseService) { }

  ngOnInit() {
    this.editForm = new FormGroup({
      nom: new FormControl(this.nomGrup, [Validators.required, Validators.pattern(/^[a-z][a-z0-9-]+$/), Validators.maxLength(15)],
                                        [this.validateGrupName()]),
      quota: new FormControl(this.quota, [Validators.required, Validators.pattern(/^([1-9]\d*)?$/)]),
      disponibles: new FormControl(this.minutsDisponibles)
    });

    this.topeQuota = this.quota + this.minutsDisponibles;

  }

  onEditGroupFormChangeQuotaValues(valorInput: number) {

    console.log(valorInput);


    if (this.editForm.get('quota').value < this.topeQuota) {


      let resta = this.editForm.get('quota').value - this.quota;
      console.log('resta: ' + resta);

      if (resta > 0) { // Augmenta quota
        const minutsDisponibles = this.minutsDisponibles - resta;

        if ( minutsDisponibles < 0) {
          this.editForm.patchValue({
            quota: this.quota,
            disponibles: this.minutsDisponibles
          });
        } else {
          this.editForm.patchValue({
            disponibles: minutsDisponibles
          });
        }
      }

      if (resta < 0 ) {// Disminueix quota
        resta = resta * -1;
        const minutsDisponibles = this.minutsDisponibles + resta;
        this.editForm.patchValue({
          disponibles: minutsDisponibles
        });
      }

      if (resta === 0) {
        this.editForm.patchValue({
          disponibles: this.minutsDisponibles
        });
      }

    } else {
      this.editForm.patchValue({
        quota: this.topeQuota,
        disponibles: 0
      });
    }

  }

  lockName() {
    this.canEditName = !this.canEditName;

    if (this.canEditName) { // Mostramos mensaje
      this.nomEditGrup = this.editForm.get('nom').value;
      const modalRef = this.modalService.open(MymodalyesnoComponent);
      modalRef.componentInstance.titol = 'Editar nom';
      modalRef.componentInstance.missatge = 'Has d\'introduïr un nom que no existeixi al sistema a cap assignatura. ' +
                                            'Vols continuar?';
      modalRef.result.then(
      (afirmatiu) => {
        // No fem res perquè s'ha de quedar a true
      },
      () => {
        this.canEditName = false;
      }
    );

    } else {
      this.editForm.get('nom').setValue(this.nomEditGrup);
    }
  }


  validateGrupName(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      console.log(control);

      return this.db.validarGroupNameNotTaken(control.value)
        .pipe(
          map(res => {
            console.log(res);

            // Comprovem si existeix i si és diferent de l'actual nom.
            if (res.nomgrupexisteix && this.nomEditGrup !== this.editForm.get('nom').value) {
              return {
                groupNameExists: true
              };
            }

          })
        );
    };

  }

}
