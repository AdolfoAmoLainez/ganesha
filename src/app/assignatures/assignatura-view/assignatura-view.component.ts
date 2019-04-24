import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-assignatura-view',
  templateUrl: './assignatura-view.component.html',
  styleUrls: ['./assignatura-view.component.css']
})
export class AssignaturaViewComponent implements OnInit, OnDestroy {

  assignaturaId;
  paramsSubs: Subscription;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.paramsSubs = this.activatedRoute.params.subscribe(
      (params) => {

        this.assignaturaId = params.assignaturaid;
      }
    );
  }

  ngOnDestroy(): void {
    this.paramsSubs.unsubscribe();
  }

}
