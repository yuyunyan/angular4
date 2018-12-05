import { Component, ViewEncapsulation, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import * as _ from 'lodash';
 
@Component({
	selector: 'az-input-dropdown',
	templateUrl: './input-dropdown.component.html',
	styleUrls: ['./input-dropdown.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class InputDropdownComponent {
	@Input() preSelectedValue: any;
	@Input() dropdownOptions: Array<any>;
	@Input() clearObjectState: Object;
	@Input() InputBoxFullWidth: boolean = false;
	@Output() onValueUpdated: EventEmitter<any>;

	private inputObject = {
		inputName: '',
		inputId: undefined,
		isStatic: true
	};

	private activeItemIndex: number;
	private selectItemIndex: number;
	private dropdownVisible: boolean = false;
	private selectedItem: any;
	private pressedDropdown: boolean = false;
	private allowCustomInput: boolean = true;

	constructor() {
		this.onValueUpdated = new EventEmitter<any>();
	}

	ngOnChanges(changes: SimpleChanges){
		let clearObject = changes['clearObjectState'];
		let preSelectedValue = changes['preSelectedValue'];
		if (clearObject && clearObject.currentValue){
			this.inputObject = {
				inputName: '',
				inputId: undefined,
				isStatic: true
			};
		}
		if (preSelectedValue && preSelectedValue.currentValue){
			let preSelectInputValue = preSelectedValue.currentValue;
			this.inputObject.isStatic = preSelectInputValue.isStatic;
			this.inputObject.inputName = preSelectInputValue.inputName;
			this.inputObject.inputId = preSelectInputValue.inputId;
		}
	}

	private onInputChange(){
		this.selectedItem = null;
		this.inputObject.isStatic = true;
		this.inputObject.inputId = null;
		this.activeItemIndex = -1;
		this.emitOutObject();
	}

	private onClick(event){
		this.showDropdown();
	}

	private onInputFocus(){
		this.showDropdown();
		if (this.activeItemIndex && this.activeItemIndex > -1){
			this.selectItemIndex = this.activeItemIndex;
		}
	};

	private onKeydown(event):void {
		let key = event.which || event.keyCode;
		if (key == 13){
			event.stopPropagation();
			this.onInputBlur(null)
		}
	}

	private onInputBlur($event){
		if (this.pressedDropdown){
			this.pressedDropdown = false;
			return;
		}
		if (!this.selectedItem){
			this.setActive(-1);
		} else {
			this.activeItemIndex = this.selectItemIndex;
		}
		this.hideDropdown()
	}

	private showDropdown(){
		this.dropdownVisible = true;
	}

	private hideDropdown(){
		this.dropdownVisible = false;
	}

	private dropdownPressed(){
		this.pressedDropdown = true;
	}

	private selectItem(dropdownOption, itemIndex){
		this.selectedItem = dropdownOption;
		this.selectItemIndex = itemIndex;
		this.hideDropdown();
		this.inputObject.inputId = dropdownOption.valueId;
		this.inputObject.inputName = dropdownOption.valueName;
		this.inputObject.isStatic = false;
		this.activeItemIndex = itemIndex;
		this.emitOutObject();
	}

	private setActive(itemIndex){
		this.activeItemIndex = itemIndex;
	}

	private setInputActive(){
		this.setActive(-1);
	}

	private emitOutObject(){
		this.onValueUpdated.emit(this.inputObject);
	}
}
