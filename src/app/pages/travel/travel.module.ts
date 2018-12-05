import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { TravelListsComponent } from './lists/lists.component';
import { TravelReportComponent } from './report/report.component';

export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path: 'travel-lists', component: TravelListsComponent, data: { breadcrumb: 'Ckeditor' } },
  { path: 'travel-report', component: TravelReportComponent, data: { breadcrumb: 'Froala Editor' } }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes)
  ],
  declarations: [
    TravelListsComponent,
    TravelReportComponent
  ]
})
export class TravelModule { }
