import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectivesModule } from '../theme/directives/directives.module';
import { PipesModule } from '../theme/pipes/pipes.module';
import { routing } from './pages.routing';
import { PagesComponent } from './pages.component';
import { BlankComponent } from './blank/blank.component';
import { MenuComponent } from '../theme/components/menu/menu.component';
import { NavbarComponent } from '../theme/components/navbar/navbar.component';
import { MessagesComponent } from '../theme/components/messages/messages.component';
import { BreadcrumbComponent } from '../theme/components/breadcrumb/breadcrumb.component';
import { BackTopComponent } from '../theme/components/back-top/back-top.component';
import { AuthGuard } from './../_guards/auth.guard';
import { Tabs } from './../_helpers/tabs';
import { Tab } from './../_helpers/tab';
import { WidgetDirectivesModule } from '../theme/directives/widgetdirective.module';
import { DocumentsService } from './../_services/documents.service';
import { SharedService } from './../_services/shared.service';
import { UsersService } from './../_services/users.service';
import { HttpService } from './../_services/httpService';
import { ItemsService } from './../_services/items.service';
import { QuoteService } from './../_services/quotes.service';
import { ContactsService } from './../_services/contacts.service';
import { CarrierService } from './../_services/carrier.service';
import { NotificationsService } from 'angular2-notifications';
import { ObjectTypeService } from './../_services/object-type.service';
import { AuthenticationService } from './../_services/authentication.service';
import { PoSoUtilities } from './../_utilities/po-so-utilities/po-so-utilities';

//import { AccountsContactsModule} from './accounts-contacts/accounts-contacts.module';
import { NgxPermissionsModule } from 'ngx-permissions';
// import { ContactsModule } from './contacts/contacts.module';
// import { AccountDetailsChildComponentComponent} from './contacts/account-details-child-component/account-details-child-component.component';
//import { UsersListComponent } from './users/users-list/users-list.component';
@NgModule({
imports: [
CommonModule,
DirectivesModule,
WidgetDirectivesModule,
PipesModule,
routing,
NgxPermissionsModule.forRoot() 
// ContactsModule
],
declarations: [ 
PagesComponent,
BlankComponent,
MenuComponent,
NavbarComponent,
MessagesComponent,
BreadcrumbComponent,
BackTopComponent,
Tabs,
Tab
//AccountDetailsChildComponentComponent
],
providers: [
DocumentsService,
SharedService,
UsersService,
HttpService,
ItemsService,
QuoteService,
ContactsService,
CarrierService,
NotificationsService,
ObjectTypeService,
AuthenticationService,
AuthGuard,
PoSoUtilities
]
})
export class PagesModule { }
