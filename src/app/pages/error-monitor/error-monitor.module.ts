import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { HttpService} from './../../_services/httpService';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { AgGridModule} from 'ag-grid-angular/main';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SplitPaneModule } from 'ng2-split-pane/lib/ng2-split-pane';
import { ErrorManagementService } from './../../_services/errorManagement.service';

import { ErrorMonitorGridComponent } from './error-monitor-grid/error-monitor-grid.component';
import { ErrorLogDetailComponent } from './error-log-detail/error-log-detail.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path: 'error-log-detail', component: ErrorLogDetailComponent, data:{ breadcrumb:'error-log-detail'}},
  { path: '', component: ErrorMonitorGridComponent, data: { breadcrumb:'error-monitor-grid'}}
];

@NgModule({
  imports: [                                                                                                                                                                                    
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    WidgetDirectivesModule,
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    AgGridModule.withComponents( [])
  ],
  declarations: [
    ErrorMonitorGridComponent,
    ErrorLogDetailComponent
  ],
  providers:[HttpService, ErrorManagementService]
})

export class ErrorMonitorModule { }
