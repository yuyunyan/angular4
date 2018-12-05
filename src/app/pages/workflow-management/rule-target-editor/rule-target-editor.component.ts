import { Component, OnInit, ViewChild, ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { Subject } from 'rxjs/Subject';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import * as _ from 'lodash';

@Component({
	selector: 'Rule-target-editor',
	templateUrl: './rule-target-editor.component.html',
	styleUrls: ['./rule-target-editor.component.scss']
})
export class RuleTargetEditorComponent implements AgEditorComponent, OnDestroy {

	private params: any;
	private _params;
	private options: any[];
	private selectedValue: any;
	private selectedName: any;
	private colName: string;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private preSelectedValue = {
		inputName: '',
		inputId: undefined,
		isStatic: true
	};
	private clearInputObject;

	@ViewChild('container', {read: ViewContainerRef}) container;
	constructor(
		private workflowManagementService: WorkflowManagementService
	) {
		this.workflowManagementService.GetActionCellStatus()
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(dynamicValues => {
			this.options = dynamicValues;
			this.clearInputObject = {clearObjectState: true}
			this.selectedValue = undefined;
			this.selectedName = "";
		});
	}

	agInit(params:any):void {
		this._params = params;
		this.selectedValue = params.value.id;
		this.selectedName = params.value.name;
		this.colName = this._params.column.colId;
		if (this.colName == 'target') {
			this.options = params.node.data.dynamicValues;
		}
		if (!this.selectedValue){
			this.preSelectedValue = {
				isStatic: true,
				inputName: params.value.name,
				inputId: undefined,
			};
		} else {
			this.preSelectedValue = {
				isStatic: false,
				inputName: params.value.name,
				inputId: params.value.id,
			};
		}
	}

	getValue():any {
		return {
			id: this.selectedValue,
			name: this.selectedName
		}
	}

	isPopup():boolean {
		return false;
	}

	focusIn(){
		this.container.element.nativeElement.querySelector("input").focus();
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

	onValueUpdated(value){
		this.selectedValue = value.inputId;
		this.selectedName = value.inputName
	}

	ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
}
