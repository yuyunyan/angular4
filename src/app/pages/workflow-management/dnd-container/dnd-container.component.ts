import { Component, OnInit, ViewEncapsulation, Input  } from '@angular/core';
import { Guid } from './../../../_utilities/Guid/Guid';
import { WorkflowManagementService } from './../../../_services/workflow-management.service';
import { DndDraggableConfig, DndDraggable } from 'ngx-drag-and-drop-lists'
import * as _ from 'lodash';
import * as pluralize from 'pluralize';
import { StateEngineRuleGroup, StateEngineColumn, StateEngineRuleCondition } from '../../../_models/workflow-management/stateEngineRuleGroup';

@Component({
  selector: 'az-dnd-container',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './dnd-container.component.html',
  styleUrls: ['./dnd-container.component.scss']
})
export class DnDContainerComponent{
	@Input() model: { type: string, id: number, columns };
  @Input() list: any[];
  @Input() onReadonly: boolean;

  constructor(
    private guid: Guid,
    private workflowManagementService: WorkflowManagementService){

  }
  public removeItem(item: any, list: any[]): void {
    list.splice(list.indexOf(item), 1);
  }

  onDragEnded(){
  }

  onCreateGroup(model, list){
    let newGroup = new StateEngineRuleGroup();
    newGroup.columns = [];
    newGroup.isAll = false;
    newGroup.ruleId = model.ruleId;
    newGroup.objectTypeId = model.objectTypeId,
    newGroup.parentGroupId = model.ruleGroupId? model.ruleGroupId: model.tempId;
    newGroup.tempId = this.guid.newGuid();
    newGroup.type = "ruleGroup";
    model.columns.push(newGroup);
  }

  onCreateCondition(model, list){
    this.workflowManagementService.EmitConditionModalOpen(model);
    jQuery('.modal-backdrop').css('z-index', '100');
  }

  private GetRuleConditionDescription(condition){
    let words = condition.conditionName.split(' ');
		if (!words || words.length < 1){
			return;
		}
    return  ` ${pluralize.isSingular(words[words.length - 1])? 'is': 'are'} ` +
      `${_.lowerCase(condition.comparisonName)} `;
  }
}
