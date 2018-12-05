import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PermissionService } from './../../../_services/permissions.service';
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'az-items-detail-master',
  templateUrl: './items-detail-master.component.html',
  styleUrls: ['./items-detail-master.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ItemsDetailMasterComponent {

  private itemId: number;
  private itemObjectTypeId: number = 103; //Todo: create api to get objectTypeId for Item
  private itemPermissions;
  private objectPermissionList;
  constructor(
    private route: ActivatedRoute,
    private permissionsService: PermissionService,
    private ngxPermissionsService: NgxPermissionsService,
  ) {
    
  }

	ngOnInit(){
    const _self = this;
    this.route.params.subscribe(params => {
      this.itemId = +params['itemId'];
      const objectId = this.itemId || 0;
      this.permissionsService.getFieldPermissions(objectId, this.itemObjectTypeId).subscribe(data => {
        _self.itemPermissions = data.fieldPermissionList;
        _self.objectPermissionList = data.objectPermissionList;
        _self.ngxPermissionsService.loadPermissions(data.objectPermissionList);
      });
    });
  }
};
