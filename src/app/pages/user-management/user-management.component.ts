import { Component, OnInit,AfterViewInit, ViewEncapsulation } from '@angular/core';
import {GridOptions, ColumnApi} from "ag-grid";
import { UsersService } from './../../_services/users.service';
import { UserDetail } from './../../_models/userdetail';
import {ClickableParentComponent} from "./clickable.parent.component";

@Component({
  selector: 'az-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['user-management.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserManagementComponent implements OnInit, AfterViewInit {
   
  private gridOptions: GridOptions;
  Users : UserDetail[];
  public userData= [];
  public message: string;
  private searchString:'';

  constructor(private userService: UsersService) {
   
    };
  
ngAfterViewInit(): void {
    
  }

 ngOnInit( ) {
   var _self = this;
        this.gridOptions = {};
    this.gridOptions.enableColResize = true;
    
    this.gridOptions.columnDefs = [
       {
        headerName: "User Name",
        field: "userName",
        headerClass:"grid-header",
       },
       {
        headerName: "First Name",
        field: "firstName",
        headerClass:"grid-header"
      },
       {
        headerName: "Last Name",
        field: "lastName",
        headerClass:"grid-header"
      },
      { 
        headerName: "Email",
        field: "emailAddress",
        headerClass:"grid-header"
      },
      {
        headerName: "LastLogin",
        field: "lastLogin",
        headerClass:"grid-header",
        
      },
      {
        headerName: "UserID",
        field: "userID",
        headerClass:"grid-header",
        hide:true
      },
      {
        headerName: "OrganizationID",
        field: "OrganizationID",
         headerClass:"grid-header"
         
      },
      {
        headerName:"",
        field:"userID",
        cellRenderer :  function(params) {
         
        var eDiv = document.createElement('div');
        
        //eDiv.innerHTML = '<span class="my-css-class"><button class="btn-inactivate">Push Me</button></span>';
       //eDiv.innerHTML = '<span class="my-css-class"><input type="image" class="btn-inactivate" src="./../../../assets/img/users/delete-icon.png" /></span>';
        eDiv.innerHTML = '<span class="btn-inactivate fa fa-lock" ></span>';
        
        var eButton = eDiv.querySelectorAll('.btn-inactivate')[0];
        
        eButton.addEventListener('click', function() {
                
            _self.userService.setUserStatus(params.data.userID, false)
            .subscribe(
              data =>{
                var res = data.json();
                if(res)
                  {
                    _self.gridOptions.api.removeItems([params.node]);
                  }
                  else{
                    _self.message = "Failed to set the status";
                  }
              }, 
              error => {
                _self.message = "failed with message" + error;
              }
              );
        });

        return eDiv;
        },
        width: 250
      }
    ];
    this.gridOptions.rowSelection = "single";
    this.gridOptions.rowHeight = 40;
    this.gridOptions.headerHeight = 40;
    
    this.userService.getUsers(true,this.searchString).subscribe(users =>{
     let response = users.json();
     this.Users = new Array<UserDetail>();
     response.forEach(element => {
       let userDetail = new UserDetail();
       userDetail.EmailAddress=element.EmailAddress;
       userDetail.FirstName = element.FirstName;
       userDetail.LastName = element.LastName;
       userDetail.UserID = element.UserID;
       userDetail.OrganizationID= element.OrganizationID;
       userDetail.LastLogin= element.dateLastLogin;
       userDetail.UserName = element.UserName;
       this.Users.push(userDetail);
     });

     let dataSource = [];
     //console.log(dataSource);
     this.Users.forEach(element => {
     dataSource.push({
       userName: element.UserName,
       firstName: element.FirstName,
       lastName: element.LastName,
       lastLogin: element.LastLogin,
       userID: element.UserID,
       OrganizationID: element.OrganizationID,
       emailAddress:element.EmailAddress
     })});

    //this.gridOptions.api.setRowData(dataSource);
    this.userData = dataSource;
    this.gridOptions.api.sizeColumnsToFit();
    });
  }

//To get the row clicked event

 public onRowDoubleClicked(e) {
        if (e.event.target !== undefined) {
            console.log(e.node.data.userID);
        }
    }

//Example to save the state of the Grid
  // ngAfterViewInit() {
  //  if(localStorage.getItem('tableState'))
  //   {
  //     //this.gridOptions.columnApi.setColumnState(JSON.parse(localStorage.getItem('tableState')));
  //   }
  // }

  // save(){
  //   //var state = this.gridOptions.columnApi.getColumnState();
  //  // localStorage.setItem('tableState',JSON.stringify(state));
  // }

}
