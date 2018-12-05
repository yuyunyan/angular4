import { Component, OnInit, AfterViewInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { GridOptions, ColumnApi } from "ag-grid";
import { UsersService } from './../../../_services/users.service';
import { UserDetail } from './../../../_models/userdetail';
import { default as swal } from 'sweetalert2';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';


@Component({
  selector: 'az-user-management',
  templateUrl: './user-list.component.html',
  // styleUrls: ['user-list.component.scss'],
  // encapsulation: ViewEncapsulation.None
})
export class UsersListComponent implements OnInit, OnDestroy {

  private gridOptions: GridOptions;
  Users: UserDetail[];
  public userData = [];
  public message: string;
  private ngUnsubscribe: Subject<void> = new Subject<void>();
  private showActiveUser: boolean = true;
  private searchString:string='';
 
  constructor(private userService: UsersService, private router: Router) {
    this.gridOptions={
      pagination:true,
      paginationPageSize:25,
      enableColResize:true,
      suppressContextMenu:true,
      toolPanelSuppressSideButtons:true,
      defaultColDef:{suppressMenu:true}
    }

  };

  ngOnInit() {
    const _self = this;
    this.gridOptions.columnDefs = [
      {
        headerName: "First Name",
        field: "firstName",
        headerClass: "grid-header"
      },
      {
        headerName: "Last Name",
        field: "lastName",
        headerClass: "grid-header"
      },
      {
        headerName: "Email",
        field: "emailAddress",
        headerClass: "grid-header"
      },
      {
        headerName: "LastLogin",
        field: "lastLogin",
        headerClass: "grid-header",

      },
      {
        headerName: "UserID",
        field: "userID",
        headerClass: "grid-header",
        hide: true
      },
      {
        headerName: "Organization Name",
        field: "organizationName",
        headerClass: "grid-header"
      },
      {
        headerName: "",
        field: "userID",
        cellRenderer: _self.inActiveBtnRenderer.bind(_self),
        width: 250
      }
    ];
    this.gridOptions.rowSelection = "single";
    this.gridOptions.rowHeight = 30;
    this.gridOptions.headerHeight = 30;

    this.populateGrid();

  }

  populateGrid() {
    this.userService.getUsers(this.showActiveUser,this.searchString).takeUntil(this.ngUnsubscribe.asObservable())
      .subscribe(users => {
        let response = users.json();
        this.Users = new Array<UserDetail>();
        response.forEach(element => {
          let userDetail = new UserDetail();
          userDetail.EmailAddress = element.EmailAddress;
          userDetail.FirstName = element.FirstName;
          userDetail.LastName = element.LastName;
          userDetail.UserID = element.UserID;
          userDetail.OrganizationID = element.OrganizationID;
          userDetail.LastLogin = element.dateLastLogin;
          userDetail.UserName = element.UserName;
          userDetail.organizationName = element.organizationName;
          this.Users.push(userDetail);
        });
        let dataSource = [];
        this.Users.forEach(element => {
          dataSource.push({
            firstName: element.FirstName,
            lastName: element.LastName,
            lastLogin: element.LastLogin,
            userID: element.UserID,
            emailAddress: element.EmailAddress,
            organizationName:element.organizationName
          })
        });

        this.userData = dataSource;
        this.gridOptions.api.sizeColumnsToFit();
      });
  }

  public onRowDoubleClicked(e) {
    if (e.event.target !== undefined) {
      this.router.navigate(['/pages/users/user-detail', { userId: e.node.data.userID }]);
    }
  }

  inActiveBtnRenderer(params) {
    const _self = this;
    let eDiv = document.createElement('div');
    eDiv.innerHTML = '<span class="btn-inactivate fa fa-lock" ></span>';
    let eButton = eDiv.querySelectorAll('.btn-inactivate')[0];
    eButton.addEventListener('click', function () {
      swal({
        title: 'Are you sure?',
        text: "Are you sure you want to disable this user?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel'
      }).then(() => {
        _self.setUserStatus(params.data.userID, params.node, _self);
        _self.populateGrid();
      }).catch(swal.noop);
    });
    return eDiv;
  }

  setUserStatus(userId: number, node, _self) {
    _self.userService.setUserStatus(userId, false)
      .takeUntil(_self.ngUnsubscribe.asObservable())
      .subscribe(data => {
        var res = data.json();
        if (res) {
          _self.gridOptions.api.removeItems([node]);
        } else {
          _self.message = "Failed to set the status";
        }
      }, (error) => {
        _self.message = "failed with message" + error;
      });
  }

  changeViewType(e) {
    this.showActiveUser=e.target.value==0;
    this.populateGrid();

  }

  onAddNewUser(){
    this.router.navigate(['pages/users/register']);
  }

  searchUsers(){
    this.populateGrid();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
