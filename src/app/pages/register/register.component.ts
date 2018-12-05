import { Component, ViewEncapsulation,OnDestroy} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { RegisterServicce} from './../../_services/register.service';
import { RegisterResponse} from './../../_models/registerResponse';
import { NotificationsService } from 'angular2-notifications';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'az-register',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  providers: [RegisterServicce]
})
export class RegisterComponent implements OnDestroy {
    public router: Router;
    public form:FormGroup;
    public username:AbstractControl;
    public firstname:AbstractControl;
    public lastname:AbstractControl;
    public email:AbstractControl;
    public password:AbstractControl;
    public confirmPassword:AbstractControl;
    public registrationFailed: boolean;
    public failureMessage: string;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    public notifyOptions = {
            position: ["top", "right"],
            timeOut: 1000,
            lastOnBottom: true
        }

    constructor(router:Router, fb:FormBuilder,private _registerService:RegisterServicce,  private _notificationsService: NotificationsService){
        this.router = router;
        this.form = fb.group({
            firstname: ['', Validators.compose([Validators.required])],
            lastname: ['', Validators.compose([Validators.required])],
            username: ['', Validators.compose([Validators.required])],
            email: ['', Validators.compose([Validators.required, emailValidator])],
            password: ['', Validators.required],
            confirmPassword: ['', Validators.required]
        },{validator: matchingPasswords('password', 'confirmPassword')});

        this.firstname = this.form.controls['firstname'];
        this.lastname = this.form.controls['lastname'];
        this.username = this.form.controls['username'];
        this.email = this.form.controls['email'];
        this.password = this.form.controls['password'];
        this.confirmPassword = this.form.controls['confirmPassword'];
    }

     public onSubmit(values:Object):void {
        this.failureMessage = "";
        this.registrationFailed = false;
        var response:any ={};
        if (this.form.valid) {
            
            let userName = this.username.value;
            let emailaddress = this.email.value;
            let password = this.password.value;
            let firstname = this.firstname.value;
            let lastname = this.lastname.value;
            let organizationid = 0;
            let isenabled = true;
            
            //this._registerService.creatNewUser(values["name"],values["email"],values["password"])
            this._registerService.creatNewUser(userName, emailaddress, password, firstname, lastname, organizationid, isenabled)
            .takeUntil(this.ngUnsubscribe.asObservable())
            .subscribe(
               data=>{
                   let response:RegisterResponse;
                   response = data.json();
                   if(response.Success){
                       this._notificationsService.success('Good Job','Successfully created the user', {pauseOnHover: false, clickToClose: false});
                        setTimeout(() => { 
                            this.router.navigate(['/login']) 
                        }, 3000);
                   }
                   else{
                        this.registrationFailed = true;
                        this.failureMessage = response.ErrorMessage;
                   }
               },
               error => { console.log(error); }
           );
        }
        else { console.log('form not valid'); }
    }
   ngOnDestroy() {
   this.ngUnsubscribe.next();
   this.ngUnsubscribe.complete();
   }

    // destroyed(event)
    // {
    //     this.router.navigate(['/login']);
    // }
}

export function emailValidator(control: FormControl): {[key: string]: any} {
    var emailRegexp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/;    
    if (control.value && !emailRegexp.test(control.value)) {
        return {invalidEmail: true};
    }
}

export function matchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
        let password= group.controls[passwordKey];
        let passwordConfirmation= group.controls[passwordConfirmationKey];
        if (password.value !== passwordConfirmation.value) {
            return passwordConfirmation.setErrors({mismatchedPasswords: true})
        }
    }
}