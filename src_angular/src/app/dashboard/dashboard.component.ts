import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { MatPaginator } from '@angular/material/paginator';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { ClaimDialog } from './dashboard-claim';
import { UnclaimDialog } from './dashboard-unclaim';
import { DeviceDialog } from './dashboard-device';
import { ErrorDialog } from './dashboard-error';


import { ConnectorService } from '../connector.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { WarningDialog } from './dashboard-warning';
import { ThrowStmt } from '@angular/compiler';

export interface DeviceElement {
  mac: string;
  model: string;
  serial: string;
  connected: boolean;
  type: string;  
  deviceprofile_name: string;
  height: Int16Array;
  map_id: string;
  name: string;
  orientation: Int16Array;
  site_id: string;
  site_name: string;
  x:Int16Array;
  y: Int16Array;
}

export interface MistDevices {
  results: DeviceElement[];
  total: number;
  limiit: number;
  page: number;
}

export class MistHttpDatabase {
  constructor(private _httpClient: HttpClient) { }

  loadDevices(body: {}, pageIndex: number, pageSize: number): Observable<MistDevices> {
    body["page"] = pageIndex;
    body["limit"] = pageSize;
    return this._httpClient.post<MistDevices>('/api/devices/', body);
  }
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {


  headers = {};
  cookies = {};
  host = '';
  self = {};
  search = "";
  orgs = [];
  sites = [];
  org_id: string = "";
  site_id: string = "";
  device_type: string = ""
  me: string = "";

  sitesDisabled: boolean = true;
  claimDisabled: boolean = false;
  claimButton: string= "To Org";

  topBarLoading = false;
  loading = false;

  isRateLimitReached = false;
  devicesDatabase: MistHttpDatabase | null;
  filteredDevicesDatase: MatTableDataSource<DeviceElement> | null;
  devices: DeviceElement[] = []

  filters_enabled: boolean = false
  resultsLength = 0;
  displayedColumns: string[] = ['name', 'type', 'model', 'serial', 'mac', 'connected', 'site_name', 'action'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _http: HttpClient, private _appService: ConnectorService, public _dialog: MatDialog, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this._appService.headers.subscribe(headers => this.headers = headers)
    this._appService.cookies.subscribe(cookies => this.cookies = cookies)
    this._appService.host.subscribe(host => this.host = host)
    this._appService.self.subscribe(self => this.self = self || {})
    this.me = this.self["email"] || null
    if (this.self != {} && this.self["privileges"]) {
      this.self["privileges"].forEach(element => {
        if (element["scope"] == "org") {
          if (this.orgs.indexOf({ id: element["org_id"], name: element["name"] }) < 0) {
            this.orgs.push({ id: element["org_id"], name: element["name"] })
          }
        } else if (element["scope"] == "site") {
          if (this.orgs.indexOf({ id: element["org_id"], name: element["org_name"] }) < 0) {
            this.orgs.push({ id: element["org_id"], name: element["org_name"] })
          }
        }
      });
      this.orgs = this.sortList(this.orgs, "name");
      if (this.orgs.length == 1) {
        this.org_id = this.orgs[1]["id"]
      }
    }
  }


  getDevices() {
    var body = null
    if (this.site_id == "org") {
      body = { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, full: this.filters_enabled, type: this.device_type }
    } else if (this.site_id) {
      body = { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, site_id: this.site_id, full: this.filters_enabled, type: this.device_type }
    }
    if (body) {

      if (this.filters_enabled) {
        this.loading = true;
        this._http.post<DeviceElement[]>('/api/devices/', body).subscribe({
          next: data => {
            this.filteredDevicesDatase = new MatTableDataSource(data["results"]);
            this.filteredDevicesDatase.paginator = this.paginator;
            this.loading = false;
          },
          error: error => {
            var message: string = "There was an error... "
            if ("error" in error) { message += error["error"]["message"] }
            this.openError(message)
          }
        })

      } else {
        this.devicesDatabase = new MistHttpDatabase(this._http);
        merge(this.paginator.page, this.paginator.pageSize)
          .pipe(
            startWith({}),
            switchMap(() => {
              this.loading = true;
              return this.devicesDatabase!.loadDevices(body, this.paginator.pageIndex, this.paginator.pageSize);
            }),
            map(data => {
              // Flip flag to show that loading has finished.
              this.loading = false;
              this.isRateLimitReached = false;
              this.resultsLength = data.total;
              return data.results;
            }),
            catchError(() => {
              // Catch if the GitHub API has reached its rate limit. Return empty data.
              this.isRateLimitReached = true;
              return observableOf([]);
            })
          ).subscribe(data => this.devices = data);
      }
    }
  }

  changeOrg() {
    this.topBarLoading = true;
    this._http.post<any>('/api/sites/', { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id }).subscribe({
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
      this.sites = this.sortList(data.sites, "name");
    }
    this.sitesDisabled = false;
    this.topBarLoading = false;
    this.getDevices();
    this.site_id="org";
    this.claimDisabled = false;
  }

  changeSite() {
    this.claimButton = "To Site";
    this.getDevices();
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
  applySiteFilter(){
    
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDevicesDatase.filter = filterValue.trim().toLowerCase();

    if (this.filteredDevicesDatase.paginator) {
      this.filteredDevicesDatase.paginator.firstPage();
    }
  }


  // DIALOG BOXES
  // ERROR
  openError(message: string): void {
    const dialogRef = this._dialog.open(ErrorDialog, {
      data: message
    });
  }




  // CREATE DIALOG
  openClaim(): void {
    var claimCodes: string[] = [];
    const dialogRef = this._dialog.open(ClaimDialog, {
      data: { claimCodes: claimCodes, editing: false }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var body = null;
        if (this.site_id == "org") {
          body = {
            host: this.host,
            cookies: this.cookies,
            headers: this.headers,
            org_id: this.org_id,
            claimCodes: result
          }
        } else if (this.site_id) {
          body = {
            host: this.host,
            cookies: this.cookies,
            headers: this.headers,
            site_id: this.site_id,
            claimCodes: result
          }
        }
        this._http.post<any>('/api/devices/claim/', body).subscribe({
          next: data => {
            var text: string= "";
            this.getDevices()
            if (Array(result).length == 1){
              text = "1 device";
           } else {
             text = Array(result).length + " devices"
           }
          
            this.openSnackBar(text + " successfully claimed", "Done")
          },
          error: error => {
            var message: string = "Unable to create claim the devices... "
            if ("error" in error) { message += error["error"]["message"] }
            this.openError(message)
          }
        })
      }
    })
  }
  // EDIT DEVICE
  openEdit(device: DeviceElement): void {
    const dialogRef = this._dialog.open(DeviceDialog, {
      data: { sites: this.sites, device: device, editing: true }
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var body = null;
        if (this.site_id == "org") {
          body = {
            host: this.host,
            cookies: this.cookies,
            headers: this.headers,
            org_id: this.org_id,
            device: result.device
          }
        } else if (this.site_id) {
          body = {
            host: this.host,
            cookies: this.cookies,
            headers: this.headers,
            site_id: this.site_id,
            device: result.device
          }
        }
        this._http.post<any>('/api/devices/provision/', body).subscribe({
          next: data => {
            this.getDevices()
            this.openSnackBar("Device " + result.mac + " successfully provisioned", "Done")
          },
          error: error => {
            var message: string = "Unable to save changes to Device " + device.mac + "... "
            if ("error" in error) { message += error["error"]["message"] }
            this.openError(message)
          }
        })
      }
    })
  }

  // DELETE DIALOG
  openDelete(device: DeviceElement): void {
    const dialogRef = this._dialog.open(UnclaimDialog, {
      data: device
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var body = null;
        if (this.site_id == "org") {
          body = {
            host: this.host,
            cookies: this.cookies,
            headers: this.headers,
            org_id: this.org_id,
            device_mac: device.mac
          }
        } else if (this.site_id) {
          body = {
            host: this.host,
            cookies: this.cookies,
            headers: this.headers,
            site_id: this.site_id,
            device_mac: device.mac
          }
        }
        this._http.post<any>('/api/devices/unclaim/', body).subscribe({
          next: data => {
            this.getDevices()
            this.openSnackBar("Device " + device.mac + " successfully unclaimed", "Done")
          },
          error: error => {
            var message: string = "Unable to unclaim the device " + device.mac + "... "
            if ("error" in error) { message += error["error"]["message"] }
            this.openError(message)
          }
        })
      }
    });
  }

  // SNACK BAR
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      horizontalPosition: "center",
      verticalPosition: "top",
    });
  }
}

