import { Component, ViewEncapsulation, Input, OnInit,Injector } from '@angular/core';
import { AppState } from '../../../app.state';
import { UserLogInResponse } from './../../../_models/userLogInResponse';
import { UsersService } from './../../../_services/users.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { SharedService } from './../../../_services/shared.service';
import { FileDropModule, UploadFile, UploadEvent } from 'ngx-file-drop/lib/ngx-drop';
import { DocumentsService } from './../../../_services/documents.service';
import { HttpService } from './../../../_services/httpService';
import { environment } from './../../../../environments/environment';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { UserDetailComponent } from './../../../pages/users/user-detail/user-detail.component';
import { ObjectTypeService } from './../../../_services/object-type.service';
import { AuthenticationService } from '../../../_services/authentication.service';
import { ImageUtilities } from './../../../_utilities/images/image-utilities'

@Component({
    selector: 'az-navbar',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
    public files: any;
    public user = [];
    public FirstName: string;
    private LastName: string;
    private UserName: string;
    private Image: any;
    public docs = [];
    private loadedUserId: number;
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    public rowLimit: number = 10;
    public rowOffset: number = 0;
    public sortCol: string = "";
    public DescSort: boolean = true;
    public aa: string;

    private userId: number;
    //public objectTypeId: number;
    @Input() objectTypeId;
    private objectId: number;
    private loggedInResponse: UserLogInResponse;

    public isMenuCollapsed: boolean = false;
    constructor(
        private injector: Injector,
        private authenticationService: AuthenticationService,
        private DocumentsService: DocumentsService,
        private objectTypeService : ObjectTypeService,
        private httpService: HttpService,
        private sharedService: SharedService,
        private usersService: UsersService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private _state: AppState,
        private _notificationsService: NotificationsService,
        private imageUtilities: ImageUtilities) {
        this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
            this.isMenuCollapsed = isCollapsed;
        });
        this.loggedInResponse = JSON.parse(localStorage.getItem('currentUser'));
    }
    ngOnInit() {
         let d =   this.loggedInResponse = JSON.parse(localStorage.getItem('currentUser'));
         this.userId = d.userId;
            this.getUserObjectTypeId();
            this.getuser();
            if(window.location.href.indexOf("test.") > -1) {
                jQuery(".nav.az-navbar").css({"background-color": "#F79A17"});
                jQuery("#dropdownMenuButtonTop").css({"background-color": "orange"});
                jQuery(".ciHeader").remove();
            }else if(window.location.href.indexOf("ci.") > -1){
                jQuery(".nav.az-navbar").css({"background-color": "#2D922D"});
                jQuery("#dropdownMenuButtonTop").css({"background-color": "rgb(63, 167, 63)"});
                jQuery(".testHeader").remove();
            }else{
                jQuery(".testHeader").remove();
                jQuery(".ciHeader").remove();
            }
    }

    public toggleMenu() {
        this.isMenuCollapsed = !this.isMenuCollapsed;
        this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
    }
    
    getuser(){
        this.usersService.getUser(this.userId).takeUntil(this.ngUnsubscribe.asObservable())
		.subscribe(data => {
            let newdata = data.json()
            this.FirstName = newdata.FirstName;
            this.LastName = newdata.LastName;
        })
    }

    getUserObjectTypeId(){
		this.objectId = this.userId;
		this.objectTypeService.getUserObjectTypeId()
		.takeUntil(this.ngUnsubscribe.asObservable())
		.subscribe(data => {
			var newId = data;  
		this.objectTypeId = newId;
		this.getDocuments(this.objectId, this.objectTypeId, this.rowLimit, this.rowOffset, this.sortCol, this.DescSort) 
		});
	}

    getDocuments(objectId, objectTypeId, rowLimit, rowOffset, sortColumn, descSort) {
                this.objectId = this.userId;
                var sortCol = 0;
                var DescSort = 0;
                this.DocumentsService.getDocuments(this.objectId, this.objectTypeId, this.rowLimit, this.rowOffset, this.sortCol, this.DescSort).subscribe(
            data => {
                let docs = data.results;
                this.docs = data.results;
                                if (docs === undefined || docs.length == 0) {
                                        console.log("no image");
                                } else {
                                        this.docs.sort((a, b) => b.documentId - a.documentId)
                    this.Image = environment.apiEndPoint + "/Documents/" + this.docs[0].FolderPath + "/" + this.docs[0].fileNameStored;
                                }
                        })
    }

    logOut(){
        this.authenticationService.logout();
        const router = this.injector.get(Router);
        router.navigate(['/login'], { queryParams: { returnUrl: router.url }});
    }

    goToProfile(){
        const router = this.injector.get(Router);
        this.router.navigate(['/pages/users/user-profile',{userId: this.userId}]) 
    }

    imageError(event) {
		event.target.src = this.imageUtilities.defaultImage
	 }
}