import { Component, ViewEncapsulation, Input, SimpleChanges } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { ContactsService } from './../../../_services/contacts.service';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import swal from 'sweetalert2';

@Component({
  selector: 'az-contact-focuses-grid',
  templateUrl: './contact-focuses-grid.component.html',
  styleUrls: ['./contact-focuses-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ContactFocusesGridComponent{
	@Input() accountId: number;
	@Input() contactId: number;
	@Input() objectPermissionList;

  private contactFocusesGrid: GridOptions;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private contactFocusMaps: Array<any>;
	private contactFocusOptions: Array<any>;
	private focusId: number;
	private canEdit = false;

  constructor(
		private contactsService: ContactsService, 
		private _notificationsService: NotificationsService
	) {
		const _self = this;
		_self.contactFocusesGrid = {
			rowSelection: "single",
			headerHeight: 0,
			suppressContextMenu:true,
			suppressRowClickSelection: true,
			toolPanelSuppressSideButtons:true,
			defaultColDef:{
				suppressMenu:true
			}
		};

		_self.contactFocusMaps = [];
  }

  ngOnChanges(changes: SimpleChanges) {
		const accountIdChanges = changes.accountId;
		const contactIdChanges = changes.contactId;
		const objectPermissionChanges = changes.objectPermissionList;
		if (accountIdChanges && accountIdChanges.currentValue){
			this.createFocusesGrid();
			this.populateGrids();
		}
		if (objectPermissionChanges && objectPermissionChanges.currentValue){
			this.createFocusesGrid();
			this.populateGrids();
		}
  }

  populateGrids(){
		const _self = this;
		if (!this.contactId){
			this.contactId = 0;
		}
		this.contactsService.getContactFocuses(this.accountId, this.contactId).subscribe(data => {
			console.log(data);
			_self.contactFocusMaps = _.map(data.ContactFocusMaps, m => m);
			_self.contactFocusOptions = _.map(data.ContactFocusOptions, o => o);
			_self.populateFocusesGrid(_self.contactFocusMaps);
			_self.focusId = (_self.contactFocusOptions && _self.contactFocusOptions.length > 0) ? _self.contactFocusOptions[0].focusId: undefined;
		});
  }

  createFocusesGrid(){
		const _self = this;
		_self.canEdit = _.includes(this.objectPermissionList, 'CanEditFocus');
    const columnDefs = [
      {
        headerName: '',
				field: "focusName",
				cellStyle: {'border-right': 'none' }
      },
      {
        headerName: '',
				field: "",
				cellClass: 'deleteCell',
				cellRenderer: function (params) {
          return _self.deleteCellRenderer(_self, params.data);
				},
				maxWidth: 30,
				hide: !_self.canEdit
      }
		];
		_self.contactFocusesGrid.columnDefs = columnDefs;
		try{
			_self.contactFocusesGrid.api.setColumnDefs(columnDefs);
		}catch(error){}
	}
	
	populateFocusesGrid(contactFocuses: Array<any>){
		let focusDataSource =[];
		contactFocuses.forEach(element=>{
			focusDataSource.push({
				focusName: `${element.focusName} (${element.objectName})`,
				focusId: element.focusId
			})
		});
		this.contactFocusesGrid.api.setRowData(focusDataSource);
		this.contactFocusesGrid.api.sizeColumnsToFit();
	}

	deleteCellRenderer(_self, rowData){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fas fa-times';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this focus?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel'
			}).then(function() {
				_self.onDeleteClicked(_self, rowData);
			}, function(){
				
			});
		})
		div.appendChild(anchor);
		return div;
	}

	onDeleteClicked(_self, rowData){
		const payload = {
			focusId: +rowData.focusId,
			contactId: +_self.contactId,
			isDeleted: 1
		};
		_self.contactsService.setContactFocuses(payload).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully delete the focus',
					{
						pauseOnHover: false,
						clickToClose: false
					}
				);
				_self.populateGrids();
			}
		});
	}

	onCellClicked(e){
    let allRowElements2 = jQuery("#contactFocusGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#contactFocusGrid").find(`[row=${e.node.rowIndex}]`);
		allRowElements2.removeClass('highlight-row');
		allRowElements2.find('.deleteCell').css('border', 'none');
		rowElement2.addClass('highlight-row');
		rowElement2.find('.deleteCell').css('border-top', '1px solid #a9a9a9');
		rowElement2.find('.deleteCell').css('border-bottom', '1px solid #a9a9a9');
		
	}
	
	addFocus(){
		const _self = this;
		if (!_self.contactId || !_self.focusId){
			return;
		}
		const payload = {
			contactId: +_self.contactId,
			focusId: +_self.focusId,
			isDeleted: 0
		};
		_self.contactsService.setContactFocuses(payload).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully added the focus',
					{
						pauseOnHover: false,
						clickToClose: false
					}
				);
				_self.populateGrids();
			}
		});
	}
}
