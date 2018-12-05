import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { BUSY_CONFIG_DEFAULTS , IBusyConfig } from 'angular2-busy';
import { isSymbol } from 'util';

export class Loading{

	public busyConfig:IBusyConfig;
	public syncSubscription: Subscription;

	constructor(isSync:boolean) {
		
		this.busyConfig = Object.assign({}, BUSY_CONFIG_DEFAULTS, {
			template: `
				<div style="background: url('assets/img/logo/logo-loading.gif') no-repeat center 20px; background-size: 72px;">
					<div style="margin-top: 110px; text-align: center; font-size: 18px; font-weight: 700;">
						{{message}}
					</div>
				</div>
			`,
			message: isSync ? "Syncing..." : "Saving...",
			minDuration: 1500
		});
	 }

	}
