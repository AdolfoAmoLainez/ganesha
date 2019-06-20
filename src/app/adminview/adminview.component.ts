import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-adminview',
  templateUrl: './adminview.component.html',
  styleUrls: ['./adminview.component.css']
})
export class AdminviewComponent implements OnInit {

  viewSideBar = false;

  constructor() { }

  ngOnInit() {
  }

  onToggleSideBar() {
    this.viewSideBar = !this.viewSideBar;
  }

}
