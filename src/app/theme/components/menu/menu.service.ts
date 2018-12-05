import { Injectable } from '@angular/core';
import { menuItems } from './menu';
import { HttpService } from './../../../_services/httpService';
import { NavItem } from './../../../_models/navigation/navItem';
import { NavSecurity } from './../../../_models/navigation/navSecurity';
import { ActionSecurity } from './../../../_models/navigation/actionSecurity';
import { MenuItem, SubMenu } from './../../../_models/navigation/menuItem';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import * as _ from 'lodash';

@Injectable()
export class MenuService {
  private menuCreatedSubject = new Subject<any>();
  private generalPermission = 'generalPermission';

  constructor(private httpService: HttpService) {}

  public getMenuItems():Array<Object> {
    return menuItems;
  }

  getNavList(){
    let url = 'api/navigations/getNavList';
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      const navList = this.mapNavItem(res.navigations);
      return navList;
    });
  }

  mapNavItem(navList: Array<any>): Array<NavItem>{
    let navigations = new Array<NavItem>();
    _.forEach(navList, navRes => {
      let navItem = new NavItem();
      navItem.navId = navRes.navId;
      navItem.parentNavId = navRes.parentNavId > 0 ? navRes.parentNavId: null;
      navItem.icon = navRes.icon || null;
      navItem.sortOrder = navRes.sortOrder;
      navItem.interface = navRes.interface 
        ? _.replace(navRes.interface, 'pages/', '')
        : null;
      navigations.push(navItem);
    });
    return navigations
  }

  getUserGeneralSecurity(){
    let url = 'api/navigations/getUserGeneralSecurities';
    return this.httpService.Get(url).map(data => {
      let res = data.json();
      return res.generalSecurities;
    });
  }

  getUserNavSecurity(): Observable<NavSecurity[]>{
    return this.getUserGeneralSecurity()
      .map(gs => {
        return _.map(_.filter(gs, gsObject => gsObject.type == "Nav"), element => {
          let navSecurity = new NavSecurity();
          navSecurity.id = element.id;
          navSecurity.name = element.name;
          navSecurity.type = element.type;
          return navSecurity;
        });
    });
  }

  getUserActionSecurity(): Observable<ActionSecurity[]>{
    return this.getUserGeneralSecurity()
      .map(gs => {
        return _.map(_.filter(gs, gsObject => gsObject.type == "Action"), element => {
          let navSecurity = new ActionSecurity();
          navSecurity.id = element.id;
          navSecurity.name = element.name;
          navSecurity.type = element.type;
          return navSecurity;
      });
    });
  }

  getJointNavState(){
    return Observable.combineLatest(this.getNavList(), this.getUserNavSecurity(), 
      (navList: Array<NavItem>, navSecurity: Array<NavSecurity>) => {
        this.menuCreated();
        return this.createMenu(navList, navSecurity);
    });
  }

  createMenu(navList: Array<NavItem>, navSecurity: Array<NavSecurity>){
    const navSecurityIds = _.map(navSecurity, (ns:NavSecurity) => ns.id);
    const filteredNavList = _.filter(navList, (ni: NavItem) => {
      return _.includes(navSecurityIds, ni.navId);
    });

    let menuResult = new Array<MenuItem>();
    _.forEach(filteredNavList, (ni: NavItem) => {
      if (!ni.parentNavId && ni.interface) { //single level interface
        let menuItem = new MenuItem();
        const title = _.find(navSecurity, (ns: NavSecurity) => ns.id == ni.navId).name;
        menuItem.icon = ni.icon;
        menuItem.order = ni.sortOrder;
        menuItem.routerLink = ni.interface;
        menuItem.title = title;
        menuResult.push(menuItem);
      } else if (!ni.interface) { // Multi level parent
        let menuItemWithSub = new MenuItem();
        menuItemWithSub.icon = ni.icon || null;
        menuItemWithSub.order = ni.sortOrder;
        const title = _.find(navSecurity, (ns: NavSecurity) => ns.id == ni.navId).name;
        menuItemWithSub.title = title;
        const subNavItem = _.filter(filteredNavList, (fi: NavItem) => fi.parentNavId == ni.navId);
        let subMenuList = new Array<SubMenu>();
        _.forEach(subNavItem, (sni: NavItem) => {
          let subMenuItem = new SubMenu();
          const subTitle = _.find(navSecurity, (ns: NavSecurity) => ns.id == sni.navId).name;
          subMenuItem.routerLink = sni.interface;
          subMenuItem.title = subTitle;
          subMenuItem.icon = sni.icon;
          subMenuList.push(subMenuItem);
        });
        if (subMenuList.length > 0) {
          menuItemWithSub.subMenu = subMenuList;
          menuItemWithSub.routerLink = _.split(subMenuList[0].routerLink, '/')[0]; //Important line
          menuResult.push(menuItemWithSub);
        }
      }
    });
    return menuResult;
  }

  getNavPermissions(){
    return Observable.combineLatest(this.getNavList(), this.getUserNavSecurity(), 
    (navList: Array<NavItem>, navSecurity: Array<NavSecurity>) => {
      const navSecurityIds = _.map(navSecurity, (ns:NavSecurity) => ns.id);
      const filteredNavList = _.filter(navList, (ni: NavItem) => {
        return _.includes(navSecurityIds, ni.navId);
      });
      return _.reject(_.map(filteredNavList, (ni: NavItem) => ni.interface), _.isNull);
    });
  }

  getActionPermissions(){
    return this.getUserActionSecurity().map((ases: ActionSecurity[]) => {
      const actionPermissions =  _.map(ases, (as: ActionSecurity) => {
        return `${as.name}${as.id}`
      });
      localStorage.setItem(this.generalPermission, JSON.stringify(actionPermissions));
      return actionPermissions;
    });
  }
  
  getPermissions(){
    return Observable.combineLatest(this.getNavPermissions(), this.getActionPermissions(),
      (nps: Array<string>, aps: Array<string>) => {
        return _.union(nps, aps);
      });
  }

  menuCreated(){
    this.menuCreatedSubject.next({ created: true })
  }

  getMenuStatus(): Observable<any>{
    return this.menuCreatedSubject.asObservable();
  }
 
}
