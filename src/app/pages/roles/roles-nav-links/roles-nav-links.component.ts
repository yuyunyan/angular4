import { Component, ViewEncapsulation, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { RolesService } from './../../../_services/roles.service';
import { NavigationLink, Permission, Field, RoleDetails, NavTree } from './../../../_models/roles/roleDetails';
import * as _ from 'lodash';
import { ITreeOptions, IActionMapping } from 'angular-tree-component';

@Component({
	selector: 'az-roles-nav-links',
	templateUrl: './roles-nav-links.component.html',
	styleUrls: ['roles-nav-links.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class RolesNavLinksComponent{

  @Input() navTreesData;
  @Output() onSavingNavLinks: EventEmitter<any>;

  constructor() {
    this.onSavingNavLinks = new EventEmitter<any>();
  }

  ngOnChanges(changes: SimpleChanges) {
  }

	actionMapping: IActionMapping = {
    mouse: {
    }
  };

  options: ITreeOptions = {
    actionMapping: this.actionMapping
  };

  public check(node, checked) {
    this.updateChildNodeCheckbox(node, checked);
    this.updateParentNodeCheckbox(node.realParent);
    this.onSavingNavLinks.emit(this.navTreesData)
  }
  public updateChildNodeCheckbox(node, checked) {
		node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => this.updateChildNodeCheckbox(child, checked));
    }
  }
  public updateParentNodeCheckbox(node) {
    if (!node) {
      return;
    }
    let allChildrenChecked = true;
    let noChildChecked = true;

    for (const child of node.children) {
      if (!child.data.checked || child.data.indeterminate) {
        allChildrenChecked = false;
      }
      if (child.data.checked) {
        noChildChecked = false;
      }
    }
    if (allChildrenChecked) {
      node.data.checked = true;
      node.data.indeterminate = false;
    } else if (noChildChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else {
      node.data.checked = true;
      node.data.indeterminate = true;
    }
    this.updateParentNodeCheckbox(node.parent);
  }

}
