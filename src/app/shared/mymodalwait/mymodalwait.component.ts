import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-mymodalwait',
  templateUrl: './mymodalwait.component.html',
  styleUrls: ['./mymodalwait.component.css']
})
export class MymodalwaitComponent implements OnInit {
  public titol = '';
  missatge = '';

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
  }

}
