import { Component, OnInit, AfterViewInit, ViewChild,ViewContainerRef, OnDestroy, ViewEncapsulation} from '@angular/core';
import { AgEditorComponent } from "ag-grid-angular";
import { RemoteData, CompleterService, CompleterCmp } from "ng2-completer";
import { AccountsContactsService } from './../../../_services/accountsContacts.service';
import { MyRequestOptions } from './../../../_helpers/myRequestOptions';
import { environment } from './../../../../environments/environment';
import * as _ from 'lodash';

@Component({
  selector: 'az-focus-name',
	template: `
	<ng-container *ngIf="!showMfrTyperhead">
		<select #container class="form-control" [(ngModel)]="selectedValue" name="focusNameDropDown">
			<option *ngFor="let option of options" [ngValue]="option.id">{{option.name}}</option>
		</select>
	</ng-container>
	<ng-container *ngIf="showMfrTyperhead">
		<ng2-completer #mfrCompleter 
			[inputClass]="'form-control Mfr-Typeheader'"  
			name="mfrCompleter" 
			[(ngModel)]="selectedName"
			(selected)="onMfrtSelected($event)" 
			(focus)="onInputFocus()"
			(blur)="onInputFocusLost()"
			(keydown)="onInputKeydown($event)"
			(opened)="onDropdownOpened()"
			[datasource]="dataRemote" 
			[minSearchLength]="2"
			[fillHighlighted]=false>
		</ng2-completer>
	</ng-container>
	`,
	styleUrls: ['./focus-name.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class FocusNameComponent implements AgEditorComponent, AfterViewInit, OnDestroy {

  ngOnDestroy(): void {
		if (this.SelectContainer)
			this.SelectContainer.element.nativeElement.remove();

		if (this.CompleterContainer)
			this.CompleterContainer.element.nativeElement.remove();
	}
	
	private params: any;
	private _params;
	private options: any[];
	private selectedValue:any;
	private TOP_OFFSET = 30;
	private selectedName: any;
	private dataRemote: RemoteData;
	private showMfrTyperhead: boolean = false; 
	private itemSelectedBool: boolean = false;

	constructor(
		private acService: AccountsContactsService,
		private completerService: CompleterService) {
		this.acService.getTypeObjectTypeId().subscribe(objectTypeId => {
			this.options = this._params.values.filter(x => x.objectTypeId == objectTypeId)
			this.selectedValue = 10000;
			this.selectedName = "";
			this.showMfrTyperhead = (objectTypeId == 102);
		});

		let requestOptions = new MyRequestOptions();
		this.dataRemote = completerService.remote(
			null,
			"mfrName",
			"mfrName"
    );
    this.dataRemote.requestOptions(requestOptions);
		this.dataRemote.urlFormater(term => {
      return environment.apiEndPoint + '/api/items/getManufacturersList?SearchText=' + encodeURIComponent(term); 
		});
		this.dataRemote.dataField("manufacturers");
	}

	@ViewChild('container', {read: ViewContainerRef}) SelectContainer;
	@ViewChild("mfrCompleter") private mfrCompleter: CompleterCmp;
	@ViewChild('mfrCompleter', {read: ViewContainerRef}) CompleterContainer;
	

	// dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
	ngAfterViewInit() {}

	agInit(params:any):void {
		this._params = params;
		this.selectedValue = params.value.id;
		this.selectedName = params.value.name;
	
		if (this._params.node.data && this._params.node.data.objectTypeId == 102){
			this.showMfrTyperhead = true;
		}
		let tempOptions ;
		if(!this.showMfrTyperhead){
			tempOptions = this._params.values.filter(x => x.objectTypeId == 101) //commodity
			this.options = tempOptions;
		} else {
			tempOptions = this._params.values.filter(x => x.objectTypeId == 102) //mfr
			this.options = tempOptions;
		}
	}

	getValue():any {
		if (this.showMfrTyperhead){
			return {
				id: this.selectedValue,
				name: this.selectedName,
				objectTypeId: 102
			}
		}
		if(this.selectedValue)
		return this.options.find(x => x.id == this.selectedValue);
	}

	isPopup():boolean {
		return false;
	}

	focusIn(){
		this.CompleterContainer.element.nativeElement.focus();
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

	onMfrtSelected(value){
		if (value){
			this.selectedName = value.originalObject.mfrName;
			this.selectedValue = value.originalObject.mfrId
		}
	}

	
  onInputFocus(){
    this.itemSelectedBool = false;
  }

  onInputFocusLost(){
  }


  onInputKeydown(event) {
  }

  onDropdownOpened(){
  //  this.dropDownFixPosition(jQuery('#supplierGrid').find('.completer-dropdown-holder'), jQuery('#supplierGrid').find('.completer-dropdown'));
   this.dropDownFixPosition();
	}
	
	// ngDoCheck(){
	// 	this.onDropdownOpened();
	// }

//   dropDownFixPosition(button,dropdown){
	  
//     var numRows = this._params.api.getModel().getRowCount();
//     var rowIndex = this._params.node.rowIndex % 10;
//     // dropdown.css('position', 'fixed');
// 		// dropdown.css('top', (380 + 30 * rowIndex) + "px");
// 		dropdown.css('overflow-y', 'scroll');
// 		dropdown.css('max-height', "200px");
// 		button.css('margin-top', "5px");
//   } 


  dropDownFixPosition(){
	let className = this._params.value.parentClassName;
    let dropdown = jQuery(className + ' .completer-dropdown');
   let dropdownHolder = jQuery(className + '.completer-dropdown-holder');
    if(dropdownHolder && dropdown.length == 0)
    {
      dropdownHolder.each(
        (i,ele) =>    
        jQuery(ele).prependTo(jQuery(className))); 
    }
    let containerOffset = jQuery(className).offset(); 
	let eleOffSet =  jQuery( "[name='mfrCompleter']" ).offset();
    let verticalHeight = eleOffSet.top - containerOffset.top ;
    verticalHeight = verticalHeight + this.TOP_OFFSET;
    let horzlength =  eleOffSet.left - containerOffset.left;
    if(dropdown){
      dropdown.css('top', verticalHeight+'px');
      dropdown.css('left', horzlength+'px');
      dropdown.show();
    }
  }

  ngOnInit() {
	window.addEventListener('scroll', this.scroll, true); //third parameter
	}

  scroll = (): void => {
    if (window.document.getElementById("supplierGrid")){
      window.document.getElementById("supplierGrid").focus();
    }
  };

}
