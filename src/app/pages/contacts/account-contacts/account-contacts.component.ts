
import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { ContactsService } from './../../../_services/contacts.service';
import { Contacts } from './../../../_models/contactsAccount/contacts';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ContactDetails, ContactDetailsOptions, Owner, Status, Location, PreferredContactMethods } from './../../../_models/contactsAccount/contactDetails';
import { Subject } from 'rxjs/Subject';
import { debug } from 'util';

@Component({
  selector: 'az-accountContacts-list',
  templateUrl: './account-contacts.component.html',
  styleUrls: ['./account-contacts.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccountContactsComponent implements OnInit, OnDestroy {
  private ACGridOptions: GridOptions;
  private ACData = [];
  //  private rowData:any[];
  private columnDefs: any[];
  private contacts: Contacts[];
  private contactDetails: ContactDetails[];
  private contactId: number;
  private accountId: number;
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private contactsService: ContactsService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.ACGridOptions = {
      toolPanelSuppressSideButtons: true,
      suppressContextMenu:true,
      paginationPageSize:25,
      defaultColDef: {
        suppressMenu: true
      },
      getRowStyle: function (params) {
        let isActiveContact;
        if (params.node.data && params.node.data.isActive) {
          isActiveContact = true;
        }
        return { 'font-style': isActiveContact ? 'unset' : 'italic' }
      }
    };

  }

  ngOnInit() {
    this.createACGrid();
    this.activatedRoute.params
      .takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe((params: Params) => {
        this.accountId = params['accountId'];
        this.populateACGrid(this.accountId);
      });
  }

  onRowDoubleClicked(e) {
    if (e.event.target !== undefined) {
      const contactId = e.node.data.contactId;
      this.router.navigate(['/pages/accounts/contact-details', { contactId: contactId, accountId: this.accountId }]);
    }
  }

  createACGrid() {

    this.ACGridOptions.columnDefs = [
      {
        headerName: "First Name",
        field: "firstName",
        headerClass: "grid-header",
        width: 200
      },
      {
        headerName: "Last Name",
        field: "lastName",
        headerClass: "grid-header",
        width: 200
      },
      {
        headerName: "Title",
        field: "title",
        headerClass: "grid-header",
        width: 200

      },
      {
        headerName: "Phone",
        field: "phone",
        headerClass: "grid-header",
        width: 200

      },
      {
        headerName: "Email",
        field: "email",
        headerClass: "grid-header",
        width: 200

      },
      {
        headerName: "Owner",
        field: "owner",
        headerClass: "grid-header",
        width: 200
      },
      {
        headerName: "Status",
        field: "isActive",
        headerClass: "grid-header",
        cellRenderer: function (params) {
          return `<span>${params.node.data.isActive ? 'Active' : 'Inactive'}</span>`
        },
        width: 200
      }
    ]
    this.ACGridOptions.headerHeight = 35;
    this.ACGridOptions.rowHeight = 30;
    this.ACGridOptions.pagination = true;
  }

  populateACGrid(accountId: number) {
    this.contactsService.getAccountContacts(accountId).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(data => {
        var result = [];
        jQuery.each(data, function (i, e) {
          var matchingItems = jQuery.grep(result, function (item) {
            return item.contactId === e.contactId;
          });
          if (matchingItems.length === 0) {
            result.push(e);
          }
        });
        this.contacts = result;
        let dataSource = [];
        this.contacts.forEach(element => {
          dataSource.push({
            firstName: element.firstName,
            lastName: element.lastName,
            title: element.title,
            phone: element.phone,
            email: element.email,
            owner: this.ownersString(element.owner),
            contactId: element.contactId,
            isActive: element.isActive
          })
        })
        dataSource.forEach(element => {
          this.contactId = element.contactId;
        })
        this.ACData = dataSource;
      });
  }



  ownersString(array) {
    const element = [];
    if (array) {
      if (array.length > 0) {
        for (let i = 0; i < array.length; i++) {
          element.push(array[i].name)
        }
      }
    }
    return element;
  }


  addContactBtn() {
    this.router.navigate(['/pages/accounts/contact-details', { accountId: this.accountId }]);
    this.contactDetails = [];
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
