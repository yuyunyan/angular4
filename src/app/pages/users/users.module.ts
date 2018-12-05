import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from 'ng2-ckeditor';
import { FroalaEditorModule, FroalaViewModule } from 'angular2-froala-wysiwyg';
import { UsersListComponent } from './users-list/user-list.component';
import { HttpService} from './../../_services/httpService';
import { UsersService } from './../../_services/users.service';
import { ItemsService } from './../../_services/items.service';
import { QuoteService } from './../../_services/quotes.service';
import { PurchaseOrdersService } from './../../_services/purchase-orders.service';
import { HttpModule, BaseRequestOptions } from '@angular/http';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserProfileComponent } from './user-detail/user-profile.component';
import { AgGridModule} from 'ag-grid-angular/main';
import { RolesService} from './../../_services/roles.service';
import { fakeBackEndProvider} from '../../_helpers/fake-backend';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { SharedComponentModule } from './../_sharedComponent/sharedComponent.module';
import { WidgetDirectivesModule } from '../../theme/directives/widgetdirective.module';
import { UserDetailFormComponent } from './user-detail/detail-page/detail-page.component';
import { PageAccessComponent } from './user-detail/role-filter/page-access/page-access.component';
import { RoleFilterGridComponent } from './user-detail/role-filter/role-filter-grid/role-filter-grid.component';
import { UserRoleSelectEditorComponent } from './user-detail/role-filter/user-role-select-editor/user-role-select-editor.component';
import { CustomHeaderComponent } from './../_sharedComponent/az-custom-header/az-custom-header.component';
import { Timezone } from './../_sharedComponent/timezone/timezone.component';
import { Image } from './../../_models/common/image';
import { ImageUploadModule } from "angular2-image-upload";
import { UserCreationComponent } from './user-creation/user-creation.component';


export const routes = [
  { path: '', redirectTo: 'ckeditor', pathMatch: 'full'},
  { path:'user-detail',component:UserDetailComponent,data:{breadcrumb:'user-detail'}},
  { path:'user-profile',component:UserProfileComponent,data:{breadcrumb:'user-profile'}},
  { path: '', component: UsersListComponent, data: { breadcrumb: 'Ckeditor' } },
  { path:'register',component:UserCreationComponent,data:{breadcrumb:'register'}},
];

@NgModule({
  imports: [                                                                                                                                                                                          
    CommonModule,
    FormsModule,
    ImageUploadModule.forRoot(),
    FroalaEditorModule.forRoot(), FroalaViewModule.forRoot(),
    CKEditorModule,    
    RouterModule.forChild(routes),
    HttpModule,
    AgGridModule.withComponents( []),
    SimpleNotificationsModule.forRoot(),
    WidgetDirectivesModule,
    SharedComponentModule
  ],
  declarations: [
    UsersListComponent,
    UserDetailComponent,
    UserProfileComponent,
    UserDetailFormComponent,
    PageAccessComponent,
    RoleFilterGridComponent,
    UserRoleSelectEditorComponent,
    UserCreationComponent
  ],
  providers: [UsersService, HttpService, RolesService, ItemsService, QuoteService,
    fakeBackEndProvider, MockBackend, BaseRequestOptions],
  entryComponents: [UserRoleSelectEditorComponent, CustomHeaderComponent]
})

export class UsersModule { }
