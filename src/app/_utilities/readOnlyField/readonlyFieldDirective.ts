import { Directive, ElementRef, Input, Renderer, AfterContentInit, DoCheck, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FieldPermission } from './../../_models/permission/FieldPermission';
import * as _ from 'lodash';

@Directive({ selector: '[readonlyField]' })

export class ReadonlyFieldDirective implements OnChanges, DoCheck {
	private _elementRef: ElementRef;
	private _onEditBtnsGroupDiv: any;
	private _onReadonlyBtnsGroupDiv: any;
	private _extraBtnElement: any;
	private _extraBtnsDiv: any;
	private canEditFields: Array<string>;

	@Input() readonlyField: boolean;
	@Input() showSync: boolean;
	@Input() hideMenu: boolean;
	@Input() extraBtnText: string;
	@Input() objectPermissions: Array<FieldPermission>;
	@Output() onFormStatusChange = new EventEmitter<string>();
	@Output() onExtraBtnClicked = new EventEmitter<number>();
	@Output() onDeleteClick = new EventEmitter();
	readOnlyStatus: boolean;

	constructor(private elementRef: ElementRef, private renderer: Renderer) {
		// console.log('Dirctive Log, elementRef:', elementRef);
		this._elementRef = elementRef;
		this.generateControlBar();
	}

	ngOnChanges(changes: SimpleChanges){
		// console.log(changes);
		const permissionChnages = changes['objectPermissions'];
		if(permissionChnages && permissionChnages.currentValue){
			this.canEditFields = _.filter(this.objectPermissions, (op: FieldPermission) => op.canEdit)
				.map((op: FieldPermission) => op.name);
		}
		if(this.canEditFields &&  this.canEditFields.length > 0){
			jQuery('.editBtn, .syncBtn').removeAttr('disabled');
			jQuery('.syncBtn, .editBtn').css('backgroundColor','#01A282');	
        }
		const extBtnChanges = changes['extraBtnText'];
		if(extBtnChanges && extBtnChanges.currentValue){
			if (!this._extraBtnElement){
				let extraBtnElement = this.renderer.createElement(this._extraBtnsDiv, 'button');
				extraBtnElement.className += 'btn-extras btn-affirm';

				if (this.extraBtnText){
					extraBtnElement.innerHTML += '&nbsp;' + this.extraBtnText;
				}
				extraBtnElement.addEventListener('click', () => {
					this.onExtraBtnClicked.emit(1);
				})
				this._extraBtnElement = extraBtnElement;
			}
			// this._extraBtnElement.innerHTML = '&nbsp;' + this.extraBtnText;
		}

		if(this.showSync)
		{
			jQuery(".sync").show();
		}
		else{
			jQuery(".sync").hide();
		}

		if(this.hideMenu)
		{
			jQuery(".menu-div").hide();
		}
		else{
			jQuery(".menu-div").show();
		}
	}

	ngDoCheck(){
		if (this.readonlyField == true) {
			this.disableFormEdit();
		} else {
			this.enableFormEdit();
		}
	}

	disableFormEdit(){
		this._onReadonlyBtnsGroupDiv.removeAttribute('hidden', false);
		this._onEditBtnsGroupDiv.setAttribute('hidden', true);

		this.enableDisableInput('input', false);
		this.enableDisableInput('select', false);
		this.enableDisableInput('textarea', false);
		this.enableDisableButton(false);
	}

	enableFormEdit(){
		this._onEditBtnsGroupDiv.removeAttribute('hidden', false);
		this._onReadonlyBtnsGroupDiv.setAttribute('hidden', true);

		this.enableDisableInput('input', true);
		this.enableDisableInput('select', true);
		this.enableDisableInput('textarea', true);
		this.enableDisableButton(true);

	}

	enableDisableInput(controlType:string, enable:boolean)
	{
		const inputsObject = this._elementRef.nativeElement.getElementsByTagName(controlType);
		const inputsKeys = Object.keys(inputsObject);
		if (controlType == 'input'){
			inputsKeys.forEach(( key, index ) => {
				let permission = _.includes(this.canEditFields, jQuery(inputsObject[key]).attr('data-field-name'));
				if (jQuery(inputsObject[key]).attr('type') == 'text' || jQuery(inputsObject[key]).attr('type') == 'date' ||
					jQuery(inputsObject[key]).attr('type') == 'number'){
					if(enable && permission){
						inputsObject[key].removeAttribute('readonly', 'readonly');
					} else{
						if (!jQuery(inputsObject[key]).attr('type') || jQuery(inputsObject[key]).attr('type') !== 'button'){
							this.renderer.setElementAttribute(inputsObject[key], "readonly", "readonly");
						}
					}
				} else if (jQuery(inputsObject[key]).attr('type') == 'checkbox' || jQuery(inputsObject[key]).attr('type') == 'search'){
					let permission = _.includes(this.canEditFields, jQuery(inputsObject[key]).attr('data-field-name'));
					if(enable && permission){
						inputsObject[key].removeAttribute('disabled', 'disabled');
					} else{
						if (!jQuery(inputsObject[key]).attr('type') || jQuery(inputsObject[key]).attr('type') !== 'button'){
							this.renderer.setElementAttribute(inputsObject[key], "disabled", "disabled");
						}
					}
				} else {
					if(enable){
						inputsObject[key].removeAttribute('disabled', 'disabled');
					} else{
						if (!jQuery(inputsObject[key]).attr('type') || jQuery(inputsObject[key]).attr('type') !== 'button'){
							this.renderer.setElementAttribute(inputsObject[key], "disabled", "disabled");
						}
					}
				}
			});
		} else if(controlType == 'select'){
			inputsKeys.forEach(( key, index ) => {
				let permission = _.includes(this.canEditFields, jQuery(inputsObject[key]).attr('data-field-name'));
				if(enable && permission){
					inputsObject[key].removeAttribute('disabled', 'disabled');
				} else{
					if (!jQuery(inputsObject[key]).attr('type') || jQuery(inputsObject[key]).attr('type') !== 'button'){
						this.renderer.setElementAttribute(inputsObject[key], "disabled", "disabled");
					}
				}
			});
		} else if (controlType == 'textarea'){
			inputsKeys.forEach(( key, index ) => {
				let permission = _.includes(this.canEditFields, jQuery(inputsObject[key]).attr('data-field-name'));
				if(enable && permission){
					inputsObject[key].removeAttribute('readonly', 'readonly');
				} else{
					if (!jQuery(inputsObject[key]).attr('type') || jQuery(inputsObject[key]).attr('type') !== 'button'){
						this.renderer.setElementAttribute(inputsObject[key], "readonly", "readonly");
					}
				}
			});
		}
	}

	enableDisableButton(enable:boolean)
	{
		const buttonsObject = this._elementRef.nativeElement.getElementsByTagName('button');
		const buttonsKeys = Object.keys(buttonsObject);
		buttonsKeys.forEach((key, index) => {
			if(enable){
				if (buttonsObject[key].className.split(" ").indexOf("btnSave") > -1) {
					buttonsObject[key].removeAttribute('disabled', 'disabled')
				}
			}else{
				if (buttonsObject[key].className.split(" ").indexOf("btnSave") > -1) {
					this.renderer.setElementAttribute(buttonsObject[key], "disabled", "disabled");
				}
			}
		})
	}

	generateControlBar(){
		const _self = this;
		let controlBarElement = this.renderer.createElement(this._elementRef.nativeElement, 'div');
		controlBarElement.className += 'control-bar row';

		// OnReadOnlyBtns
		let onReadonlyBtns = this.renderer.createElement(controlBarElement, 'div');
		onReadonlyBtns.className += 'read-only-btn-group';
		this._onReadonlyBtnsGroupDiv = onReadonlyBtns;

		let editBtnElement = this.renderer.createElement(onReadonlyBtns, 'button');
		let editIcon = this.renderer.createElement(editBtnElement, 'i');
		editIcon.className += 'fas fa-pen-square';

		editBtnElement.innerHTML += '&nbsp;Edit';
		editBtnElement.className += 'btn-details btn-affirm editBtn';
		editBtnElement.setAttribute('disabled','disabled');
		editBtnElement.style.fontFamily = "'Roboto', sans-serif";
		editBtnElement.style.backgroundColor = 'grey';
		editBtnElement.addEventListener('click', ()=> {
				event.preventDefault();
				this.onFormStatusChange.emit('edit');
		})

		let syncBtnElement = this.renderer.createElement(onReadonlyBtns, 'button');
		let syncIcon = this.renderer.createElement(syncBtnElement, 'i');
		syncIcon.className += 'fas fa-sync';
		syncBtnElement.innerHTML += '&nbsp;Sync';
		syncBtnElement.className += 'btn-details btn-affirm syncBtn';
		syncBtnElement.setAttribute('disabled','disabled');
		syncBtnElement.style.backgroundColor = 'grey';
		syncBtnElement.addEventListener('click', ()=> {
				event.preventDefault();
				this.onFormStatusChange.emit('sync');
		})

		let tagDivElement = this.renderer.createElement(onReadonlyBtns, 'div');
		tagDivElement.className += 'dropdown menu-div';

		let tagBtnElement = this.renderer.createElement(tagDivElement, 'button');
		tagBtnElement.className += 'btn-hamburger btn-affirm tagBtn';
		let tagIcon = this.renderer.createElement(tagBtnElement, 'i');
		tagIcon.className += 'fas fa-tags';

		tagBtnElement.addEventListener('click', ()=> {
			event.preventDefault();
		});

		//OnEditBtns
		let onEditBtns = this.renderer.createElement(controlBarElement, 'div');
		this._onEditBtnsGroupDiv = onEditBtns;


		let saveBtnElement = this.renderer.createElement(onEditBtns, 'button');

		let saveIcon = this.renderer.createElement(saveBtnElement, 'i');
		saveIcon.className += 'fas fa-check';

		saveBtnElement.innerHTML += '&nbsp;Save';
		saveBtnElement.className += 'btn-details btn-affirm';
		saveBtnElement.addEventListener('click', ()=> {
				this.onFormStatusChange.emit('save');
		})
		saveBtnElement.controlType = 'submit';

		let cancelBtnElement = this.renderer.createElement(onEditBtns, 'button');
		let cancelIcon = this.renderer.createElement(cancelBtnElement, 'i');
		cancelIcon.className += 'fas fa-times';

		cancelBtnElement.innerHTML += '&nbsp;Cancel';
		cancelBtnElement.className += 'btn-details btn-negative';
		cancelBtnElement.addEventListener('click', ()=> {
				event.preventDefault();
				this.onFormStatusChange.emit('cancel');
		})


		// Extra btns
		let extraBtns = this.renderer.createElement(controlBarElement, 'div');
		this._extraBtnsDiv = extraBtns;
		if(this.extraBtnText){
			let extraBtnElement = this.renderer.createElement(extraBtns, 'button');
			extraBtnElement.className += 'btn-extras btn-affirm';

			if (this.extraBtnText){
				extraBtnElement.innerHTML += '&nbsp;' + this.extraBtnText;
			}
			extraBtnElement.addEventListener('click', () => {
					this.onExtraBtnClicked.emit();
			})
			this._extraBtnElement = extraBtnElement;
		}
	}

}
