import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'az-user-creation',
  templateUrl: './user-creation.component.html',
  styleUrls: ['./user-creation.component.scss']
})
export class UserCreationComponent implements OnInit {

  private notifyOptions = {
    position: ["top", "right"],
    timeOut: 3000,
    lastOnBottom: true
  };

  constructor() { }

  ngOnInit() {
  }

}
