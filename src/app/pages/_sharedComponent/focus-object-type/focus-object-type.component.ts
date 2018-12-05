import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import * as _ from 'lodash';

@Component({
  selector: 'az-focus-object-type',
  template: `
	<select #container class="form-control" [(ngModel)]="selectedValue" name="focusObjectDropDown" (change)="onColumnChange($event)">
		<option *ngFor="let option of options" [ngValue]="option.id">{{option.name}}</option>
	</select>
	`,
  styleUrls: ['./focus-object-type.component.scss']
})
export class FocusObjectTypeComponent implements AgEditorComponent, AfterViewInit, OnDestroy {

  ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
	private params: any;
	private _params;
	private options: any[];
	private selectedValue:any;
	private colName: string;

	constructor(private acService: AccountsContactsService) {
	}

	@ViewChild('container', {read: ViewContainerRef}) container;
	
	// dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;
		this.selectedValue = params.value.id;
		this.colName = this._params.column.colId;
		this.options = params.values;	
	}

	getValue():any {
		if(this.selectedValue)
		return this.options.find(x => x.id == this.selectedValue);
	}

	isPopup():boolean {
		return false;
	}

	focusIn(){
	//	this.container.element.nativeElement.focus();
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
		if (this.colName == 'focusObjectTypeObject') {
			const currentObjectTypeId = e.target.value.split(" ")[1];
			this.acService.typeSelected(currentObjectTypeId);
		}
	}


}
