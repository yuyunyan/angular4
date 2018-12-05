import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { Subject } from 'rxjs/Subject';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import * as _ from 'lodash';

@Component({
	selector: 'Rule-action-editor',
	template: `
	<select #container class="form-control" type="number" [(ngModel)]="selectedValue" name="statusDropDown" (change)="onColumnChange($event)">
		<option *ngFor="let option of options" [ngValue]="option.id">{{option.name}}</option>
	</select>
	`
})
export class RuleActionEditorComponent implements AgEditorComponent, AfterViewInit, OnDestroy {
    

	private params: any;
	private _params;
	private options: any[];
	private selectedValue:any;
	private colName: string;
	
	@ViewChild('container', {read: ViewContainerRef}) container;
	constructor(
		private workflowManagementService: WorkflowManagementService
	) {

	}
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;
		this.selectedValue = params.value? params.value.id: null;
		this.colName = this._params.column.colId;

		if (this.colName == 'action') {
			this.options = params.values;
		}
	}

	getValue():any {
		return this.options.find(x => x.id == this.selectedValue);
	}

	isPopup():boolean {
		return false;
	}

	focusIn(){
		this.container.element.nativeElement.focus();
	}

	onKeyDown(event):void {
		let key = event.which || event.keyCode;

		if (key == 13){
			event.stopPropagation();
		}

		if (key == 37 ||  // left
			key == 39) {  // right
			event.stopPropagation();
		}
	}

	onColumnChange(e){
		let action = _.find(this.options, o => o.id == this.selectedValue);
		this.workflowManagementService.ActionCellUpdated(action.dynamicValues);
		this._params.node.data.dynamicValues = _.map(action.dynamicValues, dm => dm);
	}

	ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
}
