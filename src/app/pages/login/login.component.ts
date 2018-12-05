import { Component, ViewEncapsulation,OnDestroy,OnInit} from '@angular/core';
import { Router, ActivatedRoute ,PRIMARY_OUTLET ,UrlSegmentGroup,UrlSegment,UrlTree} from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { AuthenticationService } from '../../_services/authentication.service';
import { MenuService } from './../../theme/components/menu/menu.service';
import { User} from '../../_models/user';
import { Subject } from 'rxjs/Subject';
import * as Rx from 'rx-dom';
import { Observable } from 'rxjs/Observable';
import { NgxPermissionsService } from 'ngx-permissions';
import {LoginTimerService} from './../../_services/loginTimer.service';
import { EmailUtil } from '../../_utilities/email/emailUtil';

@Component({
  selector: 'az-login',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers:[AuthenticationService, MenuService]
})
export class LoginComponent implements OnDestroy,OnInit {
	private router: Router;
	private form:FormGroup;
	private email:AbstractControl;
	private password:AbstractControl;
	private returnUrl:string;
	public loginFailed:boolean;
	private ngUnsubscribe: Subject<void> = new Subject<void>();
	private userPermission = 'userPermission';

	constructor(router:Router, fb:FormBuilder, private authenticationService: AuthenticationService, private route: ActivatedRoute,
		private permissionsService: NgxPermissionsService,
		private menuService: MenuService, private loginTimerService: LoginTimerService) {
		this.router = router;
		this.form = fb.group({
			'email1': ['', Validators.compose([Validators.required, emailValidator])],
			'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
		});

		this.email = this.form.controls['email1'];
		this.password = this.form.controls['password'];
		this.loginFailed = false;
	}

	ngOnInit() {
		// reset login status
		this.authenticationService.logout();
		// get return url from route parameters or default to '/'
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
		
	}

	public onSubmit(values:Object):void {
		var response :any = {};
		if (this.form.valid) {
			this.authenticationService.login(values["email1"],values["password"])
				.takeUntil(this.ngUnsubscribe.asObservable())
				.subscribe(data => {
					response = data;
					if(response.success){
						this.setUserPermissionsAndExecLoginActions(this.loginActions(this));
					}
					else{
						this.loginFailed = true;
					}
				},
				error => {
					this.loginFailed = true;
				});
		}
	}
	
	loginActions(self){
		return async function(){
			self.loginTimerService.resetTimer();
			const tree: UrlTree = self.router.parseUrl(self.returnUrl);
			const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
			if( g && g.segments){
				const s: UrlSegment[] = g.segments;
				
				let pathArray = s.map(x => x.path);
				let path = pathArray.join("/");
				let queryParams = s[s.length-1].parameters;
				self.router.navigate([path, queryParams]);
			}
			else{
				self.router.navigate([self.returnUrl]);
			}
			await self.ReloadLastestRelease(); //Pause application until reload
		}
	}

	ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	async ReloadLastestRelease(){
		if(localStorage.getItem('shouldReload')){
			localStorage.removeItem('shouldReload');
			window.location.reload(true); //Force reload
		}
		return Rx.DOM.ready().toPromise(); //Return observable when DOM get full reload 
	}
	
	setUserPermissionsAndExecLoginActions(loginActions){
		this.menuService.getPermissions().subscribe(permissionList => {
			if(!permissionList.includes("dashboard")){
				permissionList.push("dashboard");
			}
			localStorage.setItem(this.userPermission, JSON.stringify(permissionList));
			this.permissionsService.loadPermissions(permissionList);
			loginActions.call();
		});
	}
}
export function emailValidator(control: FormControl): {[key: string]: any} {
	if (control.value && !EmailUtil.isValid(control.value)) {
		return {invalidEmail: true};
	}
}
