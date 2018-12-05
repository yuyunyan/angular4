import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService} from './../../_services/httpService';
import { WorkflowManagementService } from './../../_services/workflow-management.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { AgGridModule } from 'ag-grid-angular/main';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { WorkflowManagementMasterComponent } from './workflow-management-master/workflow-management-master.component';
import { DndListModule } from 'ngx-drag-and-drop-lists';
import { WorkflowManagementConditionComponent } from './workflow-management-condition/workflow-management-condition.component';
import { DnDContainerComponent } from './dnd-container/dnd-container.component';
import { ReadonlyFieldModule } from './../../_utilities/readOnlyField/read-only-field.module';
import { GuidModule } from './../../_utilities/Guid/Guid.module'
import { ConditionEditorComponent } from './condition-editor/condition-editor.component';
import { InputDropdownComponent } from './input-dropdown/input-dropdown.component';
import { RulesListComponent } from './rules-list/rules-list.component';
import { RuleActionsComponent } from './rule-actions/rule-actions.component';
import { RuleActionEditorComponent } from './rule-action-editor/rule-action-editor.component';
import { RuleTargetEditorComponent } from './rule-target-editor/rule-target-editor.component';

export const routes = [
  { path:'', component: WorkflowManagementMasterComponent, data:{ breadcrumb:'Workflow-management'}}
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),    
    RouterModule.forChild(routes),
    HttpModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    WidgetDirectivesModule,
    SharedComponentModule,
    DndListModule,
    ReadonlyFieldModule,
    GuidModule
  ],
  declarations: [
    WorkflowManagementMasterComponent,
    WorkflowManagementConditionComponent,
    DnDContainerComponent,
    ConditionEditorComponent,
    InputDropdownComponent,
    RulesListComponent,
    RuleActionsComponent,
    RuleActionEditorComponent,
    RuleTargetEditorComponent
  ],
  providers: [HttpService, BaseRequestOptions, WorkflowManagementService],
  entryComponents: [RuleActionEditorComponent, RuleTargetEditorComponent]
})

export class WorkflowManagementModule { }
