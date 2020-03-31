import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Action } from '@sinequa/components/action';
import { LoginService } from '@sinequa/core/login';
import { AlertsService, Alert } from '../../alerts.service';
import { SearchService } from '@sinequa/components/search';
import { Utils } from '@sinequa/core/base';
import { Subscription } from 'rxjs';

@Component({
  selector: 'sq-alerts-menu',
  templateUrl: './alerts-menu.component.html'
})
export class BsAlertsMenuComponent implements OnInit, OnDestroy {

  @Input() icon: string = "fas fa-bell";
  @Input() autoAdjust: boolean = true;
  @Input() autoAdjustBreakpoint: string = 'xl';
  @Input() collapseBreakpoint: string = 'sm';
  @Input() size: string;

  menu: Action | undefined;

  // Alerts actions
  createAction: Action;
  manageAction: Action;

  constructor(
    public loginService: LoginService,
    public alertsService: AlertsService,
    public searchService: SearchService
  ) {

    this.createAction = new Action({
      text: "msg#alerts.createAlert",
      title: "msg#alerts.createAlert",
      action: () => { this.alertsService.createAlertModal(); }
    });

    this.manageAction = new Action({
      text: "msg#alerts.manageAlerts",
      title: "msg#alerts.manageAlerts",
      action: () => { this.alertsService.manageAlertsModal(); }
    });

  }

  ngOnInit() {
    this.updateMenu();
    this._alertsServiceSubscription = this.alertsService.changes.subscribe({
      next: () => { this.updateMenu(); }
    });
    this._loginServiceSubscription = this.loginService.events.subscribe(event => {
      if(event.type === "session-changed"){
        this.updateMenu();
      }
    });
    this._searchServiceSubscription = this.searchService.resultsStream.subscribe(results => {
      this.updateMenu();
    });
  }

  private _alertsServiceSubscription: Subscription;
  private _loginServiceSubscription: Subscription;
  private _searchServiceSubscription: Subscription;
  ngOnDestroy(){
    if(this._alertsServiceSubscription){
      this._alertsServiceSubscription.unsubscribe();
    }
    if(this._loginServiceSubscription){
      this._loginServiceSubscription.unsubscribe();
    }
    if(this._searchServiceSubscription){
      this._searchServiceSubscription.unsubscribe();
    }
  }

  updateMenu() {

    if (!this.loginService.complete) {
      this.menu = undefined;
      return;
    }

    let alertsActions: Action[] = [];

    if (this.alertsService.hasAlert) {
        let scrollGroup = new Action({
            scrollGroup: true,
            children: []
        });
        alertsActions.push(scrollGroup);
        for (let i = 0, ic = this.alertsService.alerts.length; i < ic; i++) {
            let alert = this.alertsService.alerts[i];
            scrollGroup.children.push(new Action({
                text: alert.name,
                data: alert,
                action: (item: Action) => {
                  //this.searchService.query = Utils.extend(this.searchService.makeQuery(), (<UserSettings.Alert>item.data).query);
                  //this.searchService.search();
                  let alert: Alert = Utils.copy(item.data);
                  this.alertsService.editAlertModal(alert);
                }
            }));
        }
    }

    if (!!this.searchService.results) {
        alertsActions.push(this.createAction);
    }

    if (this.alertsService.hasAlert) {
        alertsActions.push(this.manageAction);
    }

    this.menu = new Action({
      icon: this.icon,
      text: "msg#alerts.alerts",
      children: alertsActions
    });
  }

}
