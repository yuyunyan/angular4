import { Component, OnInit, ViewEncapsulation  } from '@angular/core';

@Component({
  selector: 'az-workflow-management',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-management-master.component.html',
  styleUrls: ['./workflow-management-master.component.scss']
})
export class WorkflowManagementMasterComponent{
  public notifyOptions = {
    position: ["top", "right"],
    timeOut: 2000,
    lastOnBottom: true
  };

  constructor() {}
}
