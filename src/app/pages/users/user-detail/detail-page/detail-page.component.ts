import { Component, ViewEncapsulation, OnDestroy, OnInit, Input,ViewChild } from '@angular/core';
import { UsersService } from './../../../../_services/users.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';
import { Password } from './../../../../_models/password/password';
import { ValueFormatterService } from 'ag-grid';
import { SharedService } from './../../../../_services/shared.service';
import { Timezone } from './../../../_sharedComponent/timezone/timezone.component';
import { FileDropModule, UploadFile, UploadEvent } from 'ngx-file-drop/lib/ngx-drop';
import { DocumentsService } from './../../../../_services/documents.service';
import { ObjectTypeService } from './../../../../_services/object-type.service';
import { HttpService } from './../../../../_services/httpService';
import { environment } from './../../../../../environments/environment';
import { ImageUtilities } from './../../../../_utilities/images/image-utilities'

@Component({
	selector: 'az-user-detail-form',
	templateUrl: './detail-page.component.html',
	styleUrls: ['./detail-page.component.scss'],
	encapsulation: ViewEncapsulation.None,
})

export class UserDetailFormComponent {
	public files: any;
	public user = [];
	public timezoneList = [];
	public FirstName: string;
	private TimezoneName: string;
	private LastName: string;
	private passwordDetails: Password;
	private UserName: string;
	private Image: any;
	public docs = [];
	private loginFailed: boolean;
	private validMessage: boolean;
	public rowLimit: number = 10;
	public rowOffset: number = 0;
	public sortCol: string = "";
	public DescSort: boolean = true;
	private onReadOnly: boolean = true;
	private organizationReadonly: boolean = true;
	private userCreationPage: boolean;


	private currentPassword: string;
	public EmailAddress: string;
	private loadedUserId: number;
	private PhoneNumber: string;
	private organizationList: Array<any>;
	public errorMessage: string;
	private Password: string;
	private userId: number;
	private organizationId: number;
	private warningMessagePassword: boolean;
	private passwordSet: boolean;
	private invalidImageType: boolean;
	private invalidImageSize: boolean;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	//public objectTypeId: number;
	@Input() objectTypeId;
	private objectId: number;
	private userCreated:boolean;
	private formWarningMessage:boolean;
	private formSubmitted: boolean;
	@ViewChild("userForm") userForm;

	constructor(
		private DocumentsService: DocumentsService,
		private httpService: HttpService,
		private sharedService: SharedService,
		private objectTypeService: ObjectTypeService,
		private usersService: UsersService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private _notificationsService: NotificationsService,
		private imageUtilities: ImageUtilities) {
		this.passwordDetails = new Password();
		this.passwordDetails.newPassword = "";

		if (window.location.href.indexOf("register") > -1) {
			this.onReadOnly = false;
			this.organizationReadonly = false;
			this.userCreationPage = true;
			this.userCreated = true;
		}

		if (!this.userCreationPage) {
			this.activatedRoute.params
				.takeUntil(this.ngUnsubscribe.asObservable())
				.subscribe((params: Params) => {
					this.userId = params['userId'];
					this.usersService.getUser(this.userId)
						.takeUntil(this.ngUnsubscribe.asObservable())
						.subscribe(userResponse => {
							const user = userResponse.json();
							this.FirstName = user.FirstName;
							this.EmailAddress = user.EmailAddress;
							this.UserName = user.UserName;
							this.LastName = user.LastName;
							this.PhoneNumber = user.PhoneNumber;
							this.organizationId = user.OrganizationID;
							this.TimezoneName = user.TimezoneName;
							this.loadedUserId = this.userId;
						});
				});
		}
	}

	btnUserSave() {
		const _self = this;
		if (this.userForm.valid) {
			this.setUser(_self);
		} else {
			this.formWarningMessage = true;
		}
	}

	btnCreateUser(){
		const _self = this;
		if(this.userForm.valid){
		    this.setUser(_self);
		}else{
			this.formWarningMessage = true;
		}
		
	}

	btnUserEdit() {
		this.onReadOnly = false;
		if (window.location.href.indexOf("profile") > -1) {
			this.organizationReadonly = true;
		} else {
			this.organizationReadonly = false;
		}
	}

	btnUserCancel() {
		//	this.router.navigate(["/pages/users"]);
		this.onReadOnly = true;
		this.organizationReadonly = true;
	}

	onInputFocusLost() {
	}

	ngOnInit() {
		this.TimezoneName = "Pacific Standard Time";
		this.RetrieveOrganizations(this.objectTypeId);
		this.getAllTimeZones();
		if (!this.userCreationPage) {
			this.getUserObjectTypeId();
		}
		if (this.objectTypeId > 0) {
		}
	}

	getUserObjectTypeId() {
		this.objectId = this.userId;
		this.objectTypeService.getUserObjectTypeId()
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				var newId = data;
				this.objectTypeId = newId;
				this.getDocuments(this.objectId, this.objectTypeId, this.rowLimit, this.rowOffset, this.sortCol, this.DescSort)
			});
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	changePassword() {
		jQuery("#changePasswordModal").show();
		this.passwordSet = false;
	}

	closeModal(passForm) {
		this.loginFailed = false;
		this.validMessage = false;
		jQuery("#changePasswordModal").hide();
		passForm.resetForm();
	}

	changePasswordButton(passForm) {
		const _self = this;
		if(passForm.valid && this.passwordDetails.confirmPassword === this.passwordDetails.newPassword) {
			this.passwordSet = true;
			this.Password = this.passwordDetails.newPassword;
			this.setUser(_self);
			jQuery("#changePasswordModal").hide();
			passForm.resetForm();
			this.loginFailed = false;
			this.validMessage = false;
		}
	}

	onInputFocusLostPassword() {
		var response: any = {};
		this.usersService.validatePassword(this.EmailAddress, this.currentPassword)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				response = data.json();
				if (response) {
					this.validMessage = true;
					jQuery('.newPassEnable').removeAttr('disabled');
					jQuery('.confirmPassEnable').removeAttr('disabled');
				}
				else {
					this.loginFailed = true;
				}

			},
				error => {
					this.loginFailed = true;
				});
	}

	onPasswordKeydown($event) {
		this.loginFailed = false;
		this.validMessage = false;
	}

	confirmPasswordOnBlur($event){
		this.validatePassword();
	}

	RetrieveOrganizations(objectTypeId: number) {
		this.sharedService.getAllOrganizations(objectTypeId)
			.takeUntil(this.ngUnsubscribe.asObservable())
			.subscribe(data => {
				this.organizationList = data;
			});
	}

	fileUploadClick() {
		this.invalidImageType = false;
		this.invalidImageSize = false;
	}

	fileChange(event) {
		this.objectId = this.userId;
		let fileList: FileList = event.target.files;
		if (fileList.length > 0) {
			let file: File = fileList[0];
			this.files = file;
			if (this.files.type !== "image/jpeg" && this.files.type !== "image/png" && this.files.type !== "image/gif" && this.files.type !== "image/tiff" && this.files.type !== "image/svg") {
				this.invalidImageType = true;
			} else if (this.files.size > 3145728) {
				this.invalidImageSize = true;
			} else if (this.invalidImageSize === false, this.invalidImageType === false) {
				let self = this;
				self.DocumentsService.saveDocument(this.objectId, this.objectTypeId, this.files).subscribe(data => {
					let res = data.json();
					if (!res.isSuccess) {
						console.log("error");
					} else {
						this.getDocuments(this.objectId, this.objectTypeId, this.rowLimit, this.rowOffset, this.sortCol, this.DescSort)
						console.log("success");
					}
				})
			}
		}
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

	getAllTimeZones() {
		this.usersService.getTimeZones().subscribe(timezones => {
			let response = timezones.json();
			this.timezoneList = response.timezones;
		});
	}

	validatePassword() {
	 if (this.passwordDetails.confirmPassword === this.passwordDetails.newPassword) {
			this.passwordSet = true;
			this.Password = this.passwordDetails.newPassword;
		}
	}

	setUser(_self){
		_self.usersService.updateUser(_self.loadedUserId, _self.UserName, _self.EmailAddress, _self.Password, _self.FirstName, _self.LastName, _self.PhoneNumber, _self.organizationId, _self.TimezoneName, true)
			.subscribe(
				data => {
					const res = data.json();
					if (!res.ErrorMessage) {
						_self._notificationsService.success('Good Job', 'Successfully saved the user', { pauseOnHover: false, clickToClose: false });
						this.onReadOnly = true;
						this.organizationReadonly = true;
						_self.errorMessage = null;
						this.userId= res.UserID;
						this.getUserObjectTypeId();
						this.userCreated = false;
					}
					else {
						_self._notificationsService.error(
							'Failed',
							'Email already exists. Please enter a different email address.',
							{
								pauseOnHover: false,
								clickToClose: false
							}
						);
						_self.errorMessage = res.ErrorMessage;
					}
					console.log("in user-detail component userID",this.userId,res.Success);
				},
				error => {
					console.log("Editing failed");
				}
			);
	}
	imageError(event) {
		event.target.src = this.imageUtilities.defaultImage
	 }
}

