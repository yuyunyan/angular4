import { Component, OnInit,AfterViewInit,ViewChild,ViewContainerRef, OnDestroy} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { UsersService } from './../../../../../_services/users.service';
import * as _ from 'lodash';

@Component({
	selector: 'role-editor-cell',
	template: `
	<select #container class="form-control" type="number" [(ngModel)]="selectedValue" name="statusDropDown" (change)="onColumnChange($event)">
		<option *ngFor="let option of options" [ngValue]="option.id">{{option.name}}</option>
	</select>
	`,
	styles: []
})
export class UserRoleSelectEditorComponent implements AgEditorComponent, AfterViewInit, OnDestroy {
    
	ngOnDestroy(): void {
		this.container.element.nativeElement.remove();
	}
	private params: any;
	private _params;
	private options: any[];
	private selectedValue:any;
	private colName: string;

	constructor(private usersService: UsersService) {
		this.usersService.getTypeObjectTypeId().subscribe(objectTypeId => {
			if (this.colName && this.colName != 'type' && this.colName != 'filterObject') {
				this.options = this._params.values.filter(x => x.objectTypeId == objectTypeId);
				this.selectedValue = this.options[0].id;

				if (this.colName == 'filterType'){
					const currentFilterObject = _.find(this._params.values, x => x.id == this.selectedValue);
					this.usersService.filterSelected(currentFilterObject);
				}
			}
		});

		this.usersService.getFilterObjectTypeId().subscribe(filterType => {
			if (this.colName && this.colName == 'filterObject'){
				let tempOptions;
				if (filterType.filterTypeId == 1){
					tempOptions = this._params.values.filter(x => x.objectTypeId == 32); //User ObjectTypeId = 32
				} else {
					tempOptions = this._params.values.filter(x => x.objectTypeId == filterType.filterObjectTypeId);
				}
				this.options = tempOptions;
				this.selectedValue = this.options[0]? this.options[0].id: null;
			}
		});
	
	}

	@ViewChild('container', {read: ViewContainerRef}) container;
	
	// dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;
		const objectTypeId = params.node.data.objectTypeId;
		this.selectedValue = params.value.id;
		this.colName = this._params.column.colId;

		if (this.colName == 'type') {
			this.options = params.values;
		} else if (this.colName == 'filterObject'){
			const filterType = this._params.node.data.filterType;
			let tempOptions;

			if (filterType.filterTypeId == 1){
				tempOptions = params.values.filter(x => x.objectTypeId == 32); //User ObjectTypeId = 32
			} else {
				tempOptions = params.values.filter(x => x.objectTypeId == filterType.filterObjectTypeId);
			}

			this.options = tempOptions;
		} else {
			this.options = params.values.filter(x => x.objectTypeId == objectTypeId);
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
		if (this.colName == "type"){
			const currentObjectTypeId = e.target.value.split(" ")[1];;
			this.usersService.typeSelected(currentObjectTypeId);
		} else if (this.colName == "filterType"){
			const currentFilterObjectTypeId = e.target.value.split(" ")[1];;
			const currentFilterObject = _.find(this._params.values, x => x.id == currentFilterObjectTypeId);
			this.usersService.filterSelected(currentFilterObject);
		}
	}
}
