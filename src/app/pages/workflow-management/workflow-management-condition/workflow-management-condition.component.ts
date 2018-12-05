import { Component, OnInit, ViewEncapsulation  } from '@angular/core';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import { NotificationsService } from 'angular2-notifications';
import { FieldPermission } from './../../../_models/permission/FieldPermission';
import { StateEngineTrigger } from './../../../_models/workflow-management/stateEngineTrigger';
import { StateEngineRuleDetail } from './../../../_models/workflow-management/stateEngineRule'
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import  * as _ from 'lodash';
import { StateEngineRuleGroup, StateEngineColumn } from '../../../_models/workflow-management/stateEngineRuleGroup';
import { StateEngineRuleAction } from '../../../_models/workflow-management/stateEngineRuleAction';
import { RegExp } from 'core-js/library/web/timers';

@Component({
  selector: 'az-workflow-management-condition',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './workflow-management-condition.component.html',
  styleUrls: ['./workflow-management-condition.component.scss']
})
export class WorkflowManagementConditionComponent{
  private ruleDetail: StateEngineRuleDetail;
  private ruleActions: Array<any>;
  private onReadonly: boolean = true;
  private RuleDetailPermissions: Array<FieldPermission>;
  private triggerOptions$: Observable<Array<StateEngineTrigger>>;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  
  constructor(
    private workflowManagementService: WorkflowManagementService,
    private _notificationsService: NotificationsService
  ) {
    const _self = this;
    _self.ruleDetail = new StateEngineRuleDetail();
    _self.ruleActions = new Array<any>();
    _self.workflowManagementService.GetConditionEditorStatus()
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        if (data){
          jQuery('#condition-editor-modal').modal('toggle');
        }
    });

    _self.workflowManagementService.GetRuleSelectionStatus()
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(rule => {
        if (rule && rule.ruleId == -1){
          _self.ClearRuleDetail(rule);
        } else if (rule && rule.ruleId){
          _self.SetupSelectedRuleDetail(rule);
        } else if (rule && rule.ruleId == 0){
          _self.SetupNewRuleDetail(rule);
        }
    });

    _self.RuleDetailPermissions = _self.workflowManagementService.GetRuleDetailPermissions();
  }

  ngAfterViewInit(){
    jQuery(".control-bar").css('position', 'absolute');
    jQuery(".control-bar").css('right', '0');
  }
	
	private removeItem(ruleCondition: any, list: any[]): void {
    list.splice(list.indexOf(ruleCondition), 1);
  }

  private saveClicked(){
    const _self = this;
    let validRuleOrder = _self.ValidateRuleOrder();
    let invalidDetail = _self.ValidateRuleDetail();
    let invalidRuleActions = _self.ValidateActions(this.ruleActions);
    if (invalidDetail || invalidRuleActions || !validRuleOrder){
      if (invalidRuleActions){
        _self._notificationsService.alert("Invalid Inputs in Action Grid", "Please fill all the required fields.")
      }
      if (invalidDetail){
        _self._notificationsService.alert("Invalid Inputs in Rule detail form", "Please fill all the required fields.")
      }
      if (!validRuleOrder){
        _self._notificationsService.alert("Invalid Inputs in Rule Order Field", "Rule order must be positive integer.")
      }
      return;
    }
    this.onReadonly = true;
    this.workflowManagementService.RuleDetailIsEditing(false);
    this.workflowManagementService.StateEngineRuleDetailSet(this.ruleDetail, this.ruleActions)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        if (data && data.RuleID){
          let ruleDetail = data;
          this.workflowManagementService.RuleViewOnReload(ruleDetail.RuleID, ruleDetail.ObjectTypeID,
            ruleDetail.RuleName, ruleDetail.RuleOrder, ruleDetail.TriggerID);
        }
    })
  }

  private onFormStatusChange(event: string) {
    const _self = this;
    if (!this.ruleDetail.objectTypeId){
      return;
    }
    if (event == 'edit') {
      this.onReadonly = false;
      this.workflowManagementService.RuleDetailIsEditing(true);
    } else if (event == 'cancel') {
      this.onReadonly = true;
      this.workflowManagementService.RuleDetailIsEditing(false);
    } else if (event == 'save') {
      _self.saveClicked();
      
    }
  }

  private ClearRuleDetail(rule){
    const _self = this;
    _self.ruleDetail = new StateEngineRuleDetail();
    _self.onReadonly = true;
  }

  private SetupNewRuleDetail(rule){
    this.ruleDetail = new StateEngineRuleDetail();
    this.ruleDetail.objectTypeId = rule.objectTypeId;
    this.onFormStatusChange('edit');
    let newRootGroup = new StateEngineRuleGroup();
    newRootGroup.type = 'ruleGroup';
    newRootGroup.objectTypeId = rule.objectTypeId;
    newRootGroup.isAll = false;
    newRootGroup.columns = new Array<StateEngineColumn>();
    this.triggerOptions$ = this.workflowManagementService.StateEngineTriggersGet(rule.objectTypeId);
    this.ruleDetail.conditions.push(newRootGroup);
    this.ruleActions = new Array<any>();
  }

  private SetupSelectedRuleDetail(rule){
    this.onFormStatusChange('cancel');
    this.workflowManagementService.StateEngineRuleGroupsGet(rule.ruleId)
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        this.triggerOptions$ = this.workflowManagementService.StateEngineTriggersGet(rule.objectTypeId);
        this.ruleDetail.ruleId = rule.ruleId;
        this.ruleDetail.ruleName = rule.ruleName;
        this.ruleDetail.triggerId = rule.triggerId;
        this.ruleDetail.ruleOrder = rule.ruleOrder;
        this.ruleDetail.objectTypeId = rule.objectTypeId;
        this.ruleDetail.conditions = [data];
    });
  }
  
  private onActionGridChanged(ruleActions){
    const _self = this;
    _self.ruleActions = _.map(ruleActions, ruleAction => {
      return _self.mapRuleActionRequest(ruleAction);
    });
  }

  private ValidateActions(ruleActions){
		const missField = _.some(ruleActions, ruleAction => !ruleAction.ActionID || (
      !ruleAction.StaticValue && !ruleAction.ValueID));
		return missField;
  }
  
  private ValidateRuleDetail(){
    const _self = this;
    let invalidRuleDetail: boolean;
    if (!_self.ruleDetail.ruleName || !_self.ruleDetail.ruleOrder || !_self.ruleDetail.triggerId){
      invalidRuleDetail = true;
    }
    return invalidRuleDetail;
  }

  private ValidateRuleOrder(){
    const _self = this;
    let ruleOrderReg = /^\d+$/;
    let validRuleOrder: boolean = false;
    if (_self.ruleDetail.ruleOrder){
      validRuleOrder = ruleOrderReg.test(_self.ruleDetail.ruleOrder.toString());
    }
    return validRuleOrder;
  }

  private mapRuleActionRequest(data){
    let ruleAction = {
      ActionID: data.action? data.action.id: null ,
      RuleActionID: data.ruleActionId,
      StaticValue: null,
      ValueID: null
    }
    if (data.target){
      if (!data.target.id){
        ruleAction.StaticValue = data.target.name;
        ruleAction.ValueID = null
      } else {
        ruleAction.StaticValue = null;
        ruleAction.ValueID = data.target.id;
      }
    }
    
    return ruleAction;
  }

  ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
