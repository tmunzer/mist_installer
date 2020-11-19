import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConnectorService } from '../connector.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialog } from './../dashboard/dashboard-error';
import { Router } from '@angular/router';

@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.css']
})
export class OrgComponent implements OnInit {

  headers = {};
  cookies = {};
  host = '';
  self = {};
  search = "";
  orgs = [];
  sites = [];
  role: string = "";
  selected_org_obj = {
    id:"",
    name:"",
    role: ""
  };
  org_id: string = "";
  site_name: string = "";
  me: string = "";
  adminMode: boolean = false;
  adminAccess: boolean = false;
  map = {
    options: {
      scrollwheel: false,
      disableDefaultUI: true,
      draggable: false,
      draggableCursor: "pointer",
      clickableIcons: false
    },
    zoom: 12
  }

  apiLoaded: Observable<boolean>;
  claimDisabled: boolean = true;
  topBarLoading = false;
  noSiteToDisplay = false;
  constructor(private _http: HttpClient, private _appService: ConnectorService, public _dialog: MatDialog, private _router: Router) { }


  ngOnInit() {
    this._appService.headers.subscribe(headers => this.headers = headers)
    this._appService.cookies.subscribe(cookies => this.cookies = cookies)
    this._appService.host.subscribe(host => this.host = host)
    this._appService.self.subscribe(self => this.self = self || {})
    this._appService.org_id.subscribe(org_id => this.org_id = org_id)
    this._appService.site_name.subscribe(site_name => this.site_name = site_name)
    this._appService.role.subscribe(role => this.role = role)
    this.me = this.self["email"] || null
    var tmp_orgs: string[] = []
    if (this.self != {} && this.self["privileges"]) {
      this.self["privileges"].forEach(element => {
        if (element["role"] == "admin" || element["role"] == "write" || element["role"] == "installer") {
          if (element["scope"] == "org") {
            if (tmp_orgs.indexOf(element["org_id"]) < 0) {
              this.orgs.push({ id: element["org_id"], name: element["name"], role: element["role"] })
              tmp_orgs.push(element["org_id"])
            }
          } else if (element["scope"] == "site") {
            if (tmp_orgs.indexOf(element["org_id"]) < 0) {
              this.orgs.push({ id: element["org_id"], name: element["org_name"], role: element["role"] })
              tmp_orgs.push(element["org_id"])
            }
          }
        }
      });
      this.orgs = this.sortList(this.orgs, "name");
      if (this.orgs.length == 1) {
        this.org_id = this.orgs[1]["id"]
      }
    }
  }
  changeOrg() {
    this.adminMode = false;
    if (this.selected_org_obj.role == "admin") {
      this.adminAccess = true;
    } else {
      this.adminAccess = false;
    }
    this.loadSites();
  }

  loadSites() {
    this.org_id = this.selected_org_obj.id
    if (this.adminMode == true) {
      this.role = this.selected_org_obj.role;
    } else {
      this.role = "installer";
    }
    this.topBarLoading = true;
    this.claimDisabled = true;
    this.sites = [];
    this._http.post<any>('/api/sites/', { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, role: this.role }).subscribe({
      next: data => this.parseSites(data),
      error: error => {
        var message: string = "There was an error... "
        if ("error" in error) {
          message += error["error"]["message"]
        }
        this.topBarLoading = false;
        this.openError(message)
      }
    })
  }
  parseSites(data) {
    if (data.sites.length > 0) {
      this.noSiteToDisplay = false;
      this.sites = this.sortList(data.sites, "name");
      this.claimDisabled = false;
    } else {
      this.noSiteToDisplay = true;
    }
    this.topBarLoading = false;
  }

  changeRole(event) {
    this.adminMode = event.checked;
    this.loadSites();
  }

  changeInstaller(site, enabled): void {
    this.topBarLoading = true
    this._http.post<any>('/api/sites/installer/', { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, site_id: site.id, enabled: enabled }).subscribe({
      next: data => {
        this.topBarLoading = false;
        site.installer = enabled;
      },
      error: error => {
        var message: string = "There was an error... "
        if ("error" in error) {
          message += error["error"]["message"]
        }
        this.topBarLoading = false;
        this.openError(message)
      }
    })
  }


  // ROUTING FUNCTION
  setSite(site): void {
    if (site != null) {
      this.site_name = site.name;
    } else {
      this.site_name = "";
    }
    this._appService.siteNameSet(this.site_name);
    this.gotoDash();
  }
  gotoDash(): void {
    this._appService.roleSet(this.role)
    this._appService.orgIdSet(this.org_id);
    this._router.navigate(["/dashboard"]);
  }


  // COMMON
  sortList(data, attribute) {
    return data.sort(function (a, b) {
      var nameA = a[attribute].toUpperCase(); // ignore upper and lowercase
      var nameB = b[attribute].toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    })
  }

  // DIALOG BOXES
  // ERROR
  openError(message: string): void {
    const dialogRef = this._dialog.open(ErrorDialog, {
      data: message
    });
  }
}
