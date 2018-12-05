import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { default as swal } from 'sweetalert2';
import { NotificationsService } from 'angular2-notifications';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { RuleObjectType } from '../../../_models/workflow-management/ruleObjectType';
import { StateEngineRule } from '../../../_models/workflow-management/stateEngineRule';
import * as _ from 'lodash';

@Component({
	selector: 'az-rules-list',
	templateUrl: './rules-list.component.html',
	styleUrls: ['rules-list.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RulesListComponent implements OnDestroy {
	private ruleData;
	private gridOptions: GridOptions;
	private ruleObjectTypeId: number;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private rowHeight = 30;
	private headerHeight = 30;
	private ruleObjectTypes$: Observable<Array<RuleObjectType>>;
	private isOnEditing: boolean = false;

	constructor(
		private workflowManagementService: WorkflowManagementService, 
		private _notificationsService: NotificationsService) {
		this.gridOptions = {
			rowHeight: this.rowHeight,
			headerHeight: this.headerHeight,
			rowSelection: "single",
			pagination: true,
			paginationPageSize: 10,
			suppressContextMenu:true,
			toolPanelSuppressSideButtons:true,
			defaultColDef:{suppressMenu:true}
			
		};
		this.ruleObjectTypes$ = this.workflowManagementService.RuleObjectTypesGet()
			.do((data) => {
				this.ruleObjectTypeId = data[0].objectTypeId;
				this.populateRuleListGrid(this.ruleObjectTypeId, null);
			});
		this.workflowManagementService.GetRuleViewStatus()
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(nextRule => {
			this.populateRuleListGrid(nextRule.objectTypeId, () => {
				this.workflowManagementService.RuleSelected(nextRule);
			});
		});
		this.workflowManagementService.RuleDetailEditingStatus()
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(IsOnEditing => {
				this.isOnEditing = IsOnEditing;
			});
	}

	ngOnInit() {
		this.createRoleListGrid();
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	onRuleObjectTypeChange(){
		this.populateRuleListGrid(this.ruleObjectTypeId, () => {
			this.workflowManagementService.RuleSelected({ruleId: -1, objectTypeId: this.ruleObjectTypeId});
		});
	}

	onAddRule(){
		let newRule = new StateEngineRule();
		newRule.ruleId = 0;
		newRule.objectTypeId = this.ruleObjectTypeId;
		this.workflowManagementService.RuleSelected(newRule);
	}

	onRowClicked(node){
		const _self = this;
		if (_self.isOnEditing){
			swal({
				title: 'Are you sure you want to discard unsaved changes this rule?',
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Confirm',
				cancelButtonText: 'Cancel'
			}).then(function() {
				_self.workflowManagementService.RuleSelected(node.data);
			}, function(){
				return;
			});
		} else {
			_self.workflowManagementService.RuleSelected(node.data);
		}
	}

	createRoleListGrid(){
		const _self = this;
		_self.gridOptions.columnDefs = [
			{
				headerName: 'Rules',
				field: "ruleName",
				headerClass: "grid-header",
				width: 250,
			},
			{
				headerName: 'Order',
				field: "ruleOrder",
				headerClass: "grid-header",
				width: 70,
				maxWidth: 70,
			},
			{
				headerName: '',
				field: 'ruleId',
				headerClass: "grid-header",
				hide: true
			},
			{
        headerName: "",
        field: "",
				headerClass: "grid-header",
        cellRenderer: function (params) {
          return _self.deleteCellRenderer(_self, params.data);
        },
				width: 30,
				maxWidth: 30,
      }
		];
	}

	populateRuleListGrid(objectTypeId: number, callBack: Function){
		const _self = this;
		this.workflowManagementService.StateEngineRulesGet(objectTypeId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				_self.setHeightOfGrid(data.length)
				_self.ruleData = _.map(data, (dataRow: StateEngineRule) => _self.createRow(dataRow));
				_self.gridOptions.api.setRowData(_self.ruleData);
				_self.workflowManagementService.DelayAsyncObservable(700)
					.takeUntil(this.ngUnsubscribe.asObservable())
					.subscribe(x => {
						_self.gridOptions.api.sizeColumnsToFit();
				});
				if (callBack){
					callBack();
				}
		});
	}

	createRow(rule: StateEngineRule){
		let ruleRow = {
			ruleId: rule.ruleId,
			ruleName: rule.ruleName,
			objectTypeId: rule.objectTypeId,
			ruleOrder: rule.ruleOrder,
			triggerId: rule.triggerId
		};
		return ruleRow;
	}

	deleteCellRenderer(_self, rowData){
		let div = document.createElement('div');
		div.className += 'deleteCellAnchor';
		jQuery(div).css({"text-align": "center", "padding-right": "2px"});
		let anchor = document.createElement('a');
		anchor.href = 'javascript:void(0)';
		let i = document.createElement('i');
		i.className = 'fa fas fa-times';
		anchor.appendChild(i);
		anchor.addEventListener("click", function (e) {
			swal({
				title: 'Are you sure you want to delete this rule?',
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
		_self.workflowManagementService.StateEngineRuleDelete(rowData.ruleId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				if (data && data.IsDeleted == 1){
					let ruleDetail = data;
					this.workflowManagementService.RuleViewOnReload(-1, _self.ruleObjectTypeId, null, null, null);
				}
		});
	}

	setHeightOfGrid(recordsCount){
		let count = (recordsCount < this.gridOptions.paginationPageSize)
			? recordsCount
			: this.gridOptions.paginationPageSize;
		
		if (count == 0){
			count = 4;
		}
    let height = this.getHeight(count + 3);
    document.getElementById('ruleListGrid').style.height = height+'px';
	}
	
	getHeight(count:number){
    return (count * (this.rowHeight )) + this.headerHeight;
  }
}
