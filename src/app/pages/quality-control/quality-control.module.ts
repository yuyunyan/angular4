import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { HttpService } from './../../_services/httpService';
import { ItemsService } from './../../_services/items.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { AgGridModule } from 'ag-grid-angular/main';
import { fakeBackEndProvider } from '../../_helpers/qc-fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { InspectionMasterComponent } from './inspection/inspection-master/inspection-master.component';
import { CheckListGridComponent } from './inspection/check-list-grid/check-list-grid.component';
import { PicturesComponent } from './inspection/pictures/pictures.component';
import { ConclusionComponent } from './inspection/conclusion/conclusion.component';
import { BuildChecklistMasterComponent } from './build-checklist/build-checklist-master/build-checklist-master.component';
import { DetailsComponent } from './build-checklist/details/details.component';
import { QuestionsComponent } from './build-checklist/questions/questions.component';
import { AssociationsComponent } from './build-checklist/associations/associations.component';
import { BuildCheckListService } from './../../_services/build-checklist.service';
import { PurchaseOrdersService } from './../../_services/purchase-orders.service';
import { SalesOrdersService } from './../../_services/sales-orders.service';
import { QuoteService } from './../../_services/quotes.service';
import { SharedService } from './../../_services/shared.service';
import { InspectionService } from './../../_services/inspection.service';
import { InspectionDetailsComponent } from './inspection/inspection-details/inspection-details.component';
import { AnswerComponent } from './inspection/check-list-grid/answer/answer.component';
import { CommentsComponent } from './inspection/check-list-grid/comments/comments.component';
import { QtyFailedComponent } from './inspection/check-list-grid/qty-failed/qty-failed.component';
import { InspectedComponent } from './inspection/check-list-grid/inspected/inspected.component';
import { ImagesComponent } from './inspection/check-list-grid/inspected/images/images.component';
import { ImageUploadModule } from 'angular2-image-upload';
import { QuestionComponent } from './inspection/check-list-grid/question/question.component';
import { UiSwitchModule } from 'angular2-ui-switch/src';
import { InspectionGridComponent } from './inspection-grid/inspection-grid.component';
import { Ng2CompleterModule, CompleterService } from 'ng2-completer';
import { NgxPermissionsModule } from 'ngx-permissions';
import { AGGridSettingsService } from './../../_services/ag-grid-settings.service';
import { ItemBreakdownComponent } from './inspection/item-breakdown/item-breakdown.component';
import { SelectEditorComponent } from './../_sharedComponent/select-editor/select-editor.component';
import { DatePickerEditorComponent } from './../_sharedComponent/date-picker-editor/date-picker-editor.component';
import { NumericInputComponent } from './../_sharedComponent/numeric-input/numeric-input.component';
import { BusyModule } from 'angular2-busy';
export const routes = [
  // { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path: 'inspections', component: InspectionGridComponent, data: { breadcrumb: 'inspections' } },
  { path: '', component: InspectionGridComponent, data: { breadcrumb: 'inspections' } },
  { path: 'inspections-details', component: InspectionMasterComponent, data: { breadcrumb: 'inspection-details' } },
  { path: 'checklist', component: BuildChecklistMasterComponent, data: { breadcrumb: 'checklist' } }

];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,    
    Ng2CompleterModule,
    ReactiveFormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,
    RouterModule.forChild(routes),
    HttpModule,
    WidgetDirectivesModule,
    AgGridModule.withComponents([]),
    SimpleNotificationsModule.forRoot(),
    SharedComponentModule,
    ImageUploadModule.forRoot(),
    UiSwitchModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: true,
      rolesIsolate: true
    }),
    BusyModule
  ],
  declarations: [InspectionMasterComponent, CheckListGridComponent, PicturesComponent, ConclusionComponent,
    BuildChecklistMasterComponent, DetailsComponent, QuestionsComponent, AssociationsComponent, InspectionDetailsComponent,
    AnswerComponent, CommentsComponent, QtyFailedComponent, InspectedComponent, ImagesComponent, QuestionComponent, InspectionGridComponent, ItemBreakdownComponent],
  providers: [HttpService, fakeBackEndProvider, MockBackend, BaseRequestOptions, BuildCheckListService,AGGridSettingsService, InspectionService, ItemsService,
    PurchaseOrdersService, SalesOrdersService, QuoteService, SharedService, CompleterService],
  entryComponents: [AnswerComponent, CommentsComponent, QtyFailedComponent, InspectedComponent, ImagesComponent, QuestionComponent, SelectEditorComponent, DatePickerEditorComponent, NumericInputComponent]
})

export class QualityControlModule { }