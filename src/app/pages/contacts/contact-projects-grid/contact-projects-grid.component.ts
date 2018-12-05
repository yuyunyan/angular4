import { Component, ViewEncapsulation, Input, SimpleChanges } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { ContactsService } from './../../../_services/contacts.service';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';
import swal from 'sweetalert2';

@Component({
  selector: 'az-contact-projects-grid',
  templateUrl: './contact-projects-grid.component.html',
  styleUrls: ['./contact-projects-grid.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ContactProjectsGridComponent{
	@Input() accountId: number;
	@Input() contactId: number;
	@Input() objectPermissionList;

  private contactProjectsGrid: GridOptions;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private contactProjectMaps: Array<any>;
	private contactProjectOptions: Array<any>;
	private projectId: number;
	private canEdit = false;

  constructor(
		private contactsService: ContactsService, 
		private _notificationsService: NotificationsService
	) {
		const _self = this;
		_self.contactProjectsGrid = {
			rowSelection: "single",
			headerHeight: 0,
			suppressContextMenu:true,
			toolPanelSuppressSideButtons:true,
			suppressRowClickSelection: true,
		};

		_self.contactProjectMaps = [];
  }

  ngOnChanges(changes: SimpleChanges) {
		const accountIdChanges = changes.accountId;
		const contactIdChanges = changes.contactId;
		const objectPermissionChanges = changes.objectPermissionList;
		if (accountIdChanges && accountIdChanges.currentValue){
			this.createProjectsGrid();
			this.populateGrids();
		}
		if (objectPermissionChanges && objectPermissionChanges.currentValue){
			this.createProjectsGrid();
			this.populateGrids();
		}
  }

  populateGrids(){
		const _self = this;
		if (!this.contactId){
			this.contactId = 0;
		}
		this.contactsService.getContactProjects(this.accountId, this.contactId).subscribe(data => {
			_self.contactProjectMaps = _.map(data.contactProjectMaps, m => m);
			_self.contactProjectOptions = _.map(data.contactProjectOptions, o => o);
			_self.populateProjectsGrid(_self.contactProjectMaps);
			_self.projectId = (_self.contactProjectOptions && _self.contactProjectOptions.length > 0) ? _self.contactProjectOptions[0].projectId: undefined;
		});
  }

  createProjectsGrid(){
		const _self = this;
		_self.canEdit = _.includes(this.objectPermissionList, 'CanEditProjects');
    const columnDefs = [
      {
        headerName: '',
				field: "name",
				cellClass: 'deleteCell',
				cellStyle: {'border-right': 'none' }
      },
      {
        headerName: '',
				field: "",
				cellRenderer: function (params) {
          return _self.deleteCellRenderer(_self, params.data);
				},
				maxWidth: 30,
				hide: !_self.canEdit
      }
		];
		_self.contactProjectsGrid.columnDefs = columnDefs;
		try{
			_self.contactProjectsGrid.api.setColumnDefs(columnDefs);
		}catch(error){}
	}
	
	populateProjectsGrid(contactProjects: Array<any>){
		let projectDataSource =[];
		contactProjects.forEach(element=>{
			projectDataSource.push({
				name: element.name,
				projectId: element.projectId
			})
		});
		this.contactProjectsGrid.api.setRowData(projectDataSource);
		this.contactProjectsGrid.api.sizeColumnsToFit();
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
				title: 'Are you sure you want to delete this project?',
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
			projectId: +rowData.projectId,
			contactId: +_self.contactId,
			isDeleted: 1
		};
		_self.contactsService.setContactProjects(payload).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully delete the project',
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
    let allRowElements2 = jQuery("#contactProjectGrid").find(`.ag-row`);
    let rowElement2 = jQuery("#contactProjectGrid").find(`[row=${e.node.rowIndex}]`);
		allRowElements2.removeClass('highlight-row');
		allRowElements2.find('.deleteCell').css('border', 'none');
		rowElement2.addClass('highlight-row')
		rowElement2.find('.deleteCell').css('border-top', '1px solid #a9a9a9');
		rowElement2.find('.deleteCell').css('border-bottom', '1px solid #a9a9a9');
	}
	
	addProject(){
		const _self = this;
		if (!_self.contactId || !_self.projectId){
			return;
		}
		const payload = {
			contactId: +_self.contactId,
			projectId: +_self.projectId,
			isDeleted: 0
		};
		_self.contactsService.setContactProjects(payload).subscribe(data => {
			if(data.isSuccess){
				this._notificationsService.success(
					'Good Job',
					'Successfully added the project',
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
