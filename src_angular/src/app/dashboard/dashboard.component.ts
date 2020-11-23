import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';

import { ClaimDialog } from '../common/common-claim';
import { UnclaimDialog } from '../common/common-unclaim';
import { ErrorDialog } from '../common/common-error';


import { ConnectorService } from '../connector.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';

export interface DeviceElement {
  mac: string;
  model: string;
  serial: string;
  connected: boolean;
  type: string;
  deviceprofile_name: string;
  height: number;
  map_id: string;
  map_name: string;
  name: string;
  orientation: number;
  site_id: string;
  site_name: string;
  x: number;
  y: number;
  isLocating: boolean;
  isSelected: boolean
}

export interface MistDevices {
  results: DeviceElement[];
  total: number;
  limiit: number;
  page: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit {

  frmDevice = this._formBuilder.group({
    name: [""],
    site_name: [""],
    map_id: [""],
    height: ["2.75", Validators.min(0)],
    orientation: ["0", [Validators.min(0), Validators.max(360)]],
    x: ["0"],
    y: ["0"]
  })

  headers = {};
  cookies = {};
  host = '';
  self = {};
  search = "";
  orgs = [];
  sites = [];
  maps = [];
  org_id: string = "";
  role: string = "";
  orgMode: boolean = false;
  site_name: string = "__any__";
  map_id: string = "__any__";
  device_type: string = ""
  me: string = "";

  claimButton: string = "To Site";

  topBarLoading = false;

  editingDevice = null;

  filteredDevicesDatase: MatTableDataSource<DeviceElement> | null;
  devices: DeviceElement[] = []

  resultsLength = 0;
  displayedColumns: string[] = ["device"];//['mac', 'name', 'type', 'model', 'serial', 'connected', 'site_name', 'action']
  private _subscription: Subscription
  
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _router: Router, private _http: HttpClient, private _appService: ConnectorService, public _dialog: MatDialog, private _formBuilder: FormBuilder, private _snackBar: MatSnackBar ) { }

  //////////////////////////////////////////////////////////////////////////////
  /////           INIT
  //////////////////////////////////////////////////////////////////////////////

  ngOnInit() {
    const source = interval(60000);

    this._appService.headers.subscribe(headers => this.headers = headers)
    this._appService.cookies.subscribe(cookies => this.cookies = cookies)
    this._appService.host.subscribe(host => this.host = host)
    this._appService.self.subscribe(self => this.self = self || {})
    this._appService.org_id.subscribe(org_id => this.org_id = org_id)
    this._appService.site_name.subscribe(site_name => this.site_name = site_name)
    this._appService.sites.subscribe(sites => this.sites = sites)
    this._appService.role.subscribe(role => this.role = role)
    this._appService.orgMode.subscribe(orgMode => this.orgMode = orgMode)


    if (this.sites.length == 0) {
      this.loadSites()
    }
    this.getDevices();
    if (this.site_name) {
      this.getMaps(this.site_name);
    }

    this.onChanges()

    this._subscription = source.subscribe(s => {this.getDevices(); console.log("ref")});

  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
  //////////////////////////////////////////////////////////////////////////////
  /////           SITE MGMT
  //////////////////////////////////////////////////////////////////////////////
  // when a device is assigned to a site
  changeSite(): void {
    this.frmDevice.controls["map_id"].setValue("")
    if (this.frmDevice.value.site_name){
      this.getMaps(this.frmDevice.value.site_name);
    }
  }

  // loads the org sites
  loadSites() {
    this.org_id = this.org_id
    this.topBarLoading = true;
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

  // parse the org sites from HTTP response
  parseSites(data) {
    if (data.sites.length > 0) {
      this.sites = this.sortList(data.sites, "name");
    }
    this.topBarLoading = false;
  }
  //////////////////////////////////////////////////////////////////////////////
  /////           LOAD MAP LIST
  //////////////////////////////////////////////////////////////////////////////

  getMaps(site_name: string) {
    this.topBarLoading = true;

    this._http.post<any>('/api/maps/', { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, site_name: site_name, role: this.role }).subscribe({
      next: data => this.parseMap(data),
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
  parseMap(data) {
    if (data.maps.length > 0) {
      var tmp_list = []
      data.maps.forEach(element => {
        if (element.url) {
          tmp_list.push(element)
        }
      });
      this.maps = this.sortList(tmp_list, "name");
    }
    this.topBarLoading = false;
    this.map_id = "__any__";
  }


  changeMap() {
    if (this.map_id == "__any__") {
      this.claimButton = "To Site";
    } else {
      this.claimButton = "To Map";
    }
    this.getDevices()
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           LOAD DEVICE LIST
  //////////////////////////////////////////////////////////////////////////////

  getDevices() {
    var body = null
    if (this.site_name == "__any__" || this.site_name == "") {
      body = { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, full: true, type: this.device_type, role: this.role }
    } else if (this.site_name) {
      body = { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, site_name: this.site_name, full: true, type: this.device_type, role: this.role }
    }
    if (body) {
      this.topBarLoading = true;
      this._http.post<DeviceElement[]>('/api/devices/', body).subscribe({
        next: data => {
          var tmp: DeviceElement[] = []
          data["results"].forEach(element => {
            if (!this.site_name || (element.site_name == this.site_name && (this.map_id == "__any__" || element.map_id == this.map_id))) {
              tmp.push(element)
            }
          });
          this.filteredDevicesDatase = new MatTableDataSource(tmp);

          this.filteredDevicesDatase.paginator = this.paginator;
          this.topBarLoading = false;
        },
        error: error => {
          var message: string = "There was an error... "
          if ("error" in error) { message += error["error"]["message"] }
          this.openError(message)
        }
      })

    }
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           EDIT DEVICE
  //////////////////////////////////////////////////////////////////////////////

  onChanges() {
    this.frmDevice.get('site_name').valueChanges
      .subscribe(site_name => {
        this.checkSiteName(site_name)
      });
  }

  checkSiteName(site_name: string): void {
    if (!site_name) {
      this.frmDevice.controls["height"].disable();
      this.frmDevice.controls["map_id"].disable();
      this.frmDevice.controls["name"].disable();
      this.frmDevice.controls["orientation"].disable();
      this.frmDevice.controls["x"].disable();
      this.frmDevice.controls["y"].disable();
    }
    else {
      this.frmDevice.controls["height"].enable();
      this.frmDevice.controls["map_id"].enable();
      this.frmDevice.controls["name"].enable();
      this.frmDevice.controls["orientation"].enable();
      this.frmDevice.controls["x"].enable();
      this.frmDevice.controls["y"].enable();
    }

  }

  editDevice(device: DeviceElement): void {
    if (device == this.editingDevice) {
      this.discardDevice();
      device.isSelected = true;
    }
    else {
      this.editingDevice = device;
      this.frmDevice.controls["map_id"].setValue(this.editingDevice.map_id)
      this.frmDevice.controls["name"].setValue(this.editingDevice.name)
      this.frmDevice.controls["site_name"].setValue(this.editingDevice.site_name)
      this.frmDevice.controls["height"].setValue(this.editingDevice.height)
      this.frmDevice.controls["orientation"].setValue(this.editingDevice.orientation)
      this.frmDevice.controls["x"].setValue(this.editingDevice.x)
      this.frmDevice.controls["y"].setValue(this.editingDevice.y)
      this.checkSiteName(this.frmDevice.value.site_name)
      if (this.editingDevice.site_name) {
        this.getMaps(this.editingDevice.site_name)
      }
      device.isSelected = true;
    }
    console.log(this.editingDevice)
  }

  saveDevice(): void {
    var body = {
      host: this.host,
      cookies: this.cookies,
      headers: this.headers,
      role: this.role,
      org_id: this.org_id,
      device: this.frmDevice.getRawValue(),
      device_mac: this.editingDevice.mac
    }
    this._http.post<any>('/api/devices/provision/', body).subscribe({
      next: data => {
        this.getDevices()
        this.openSnackBar("Device " + this.editingDevice.mac + " successfully provisioned", "Done")
      },
      error: error => {
        var message: string = "Unable to save changes to Device " + this.editingDevice.mac + "... "
        if ("error" in error) { message += error["error"]["message"] }
        this.openError(message)
      }
    })
  }
  discardDevice(): void {
    this.frmDevice = this._formBuilder.group({
      height: ["", Validators.min(0)],
      map_id: [""],
      name: [""],
      orientation: [""],
      site_name: [""],
      x: [""],
      y: [""]
    })
    this.editingDevice = null;
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           LOCATE DEVICE
  //////////////////////////////////////////////////////////////////////////////
  locate(): void {
    var device = this.editingDevice
    if (device.isLocating == true) {
      this._http.post<any>('/api/devices/unlocate/', { host: this.host, cookies: this.cookies, headers: this.headers, role: this.role, org_id: this.org_id, device_mac: device.mac }).subscribe({
        next: data => {
          this.openSnackBar("Location  of the Device " + this.editingDevice.mac + " stopped", "Done")
          device.isLocating = false
        },
        error: error => {
          var message: string = "There was an error... "
          if ("error" in error) {
            message += error["error"]["message"]
          }
          this.openError(message)
        }
      })
    } else {
      this._http.post<any>('/api/devices/locate/', { host: this.host, cookies: this.cookies, headers: this.headers, role: this.role, org_id: this.org_id, device_mac: device.mac }).subscribe({
        next: data => {
          this.openSnackBar("Location  of the Device " + this.editingDevice.mac + " started", "Done")
          device.isLocating = true
        },
        error: error => {
          var message: string = "There was an error... "
          if ("error" in error) {
            message += error["error"]["message"]
          }
          this.openError(message)
        }
      })
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           COMMON
  //////////////////////////////////////////////////////////////////////////////
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filteredDevicesDatase.filter = filterValue.trim().toLowerCase();

    if (this.filteredDevicesDatase.paginator) {
      this.filteredDevicesDatase.paginator.firstPage();
    }
  }

  back(): void {
    this._router.navigate(["/select"]);
  }

  //////////////////////////////////////////////////////////////////////////////
  /////           DIALOG BOXES
  //////////////////////////////////////////////////////////////////////////////
  // ERROR
  openError(message: string): void {
    const dialogRef = this._dialog.open(ErrorDialog, {
      data: message
    });
  }


  // CREATE DIALOG
  openClaim(): void {
    var body = {
      host: this.host,
      cookies: this.cookies,
      headers: this.headers,
      org_id: this.org_id,
      site_name: this.site_name,
      map_id: this.map_id,
      claim_codes: null
    }

    const dialogRef = this._dialog.open(ClaimDialog, {
      data: { body: body }
    })
    dialogRef.afterClosed().subscribe(result => {
      this.getDevices()
    })
  }


  // DELETE DIALOG
  openDelete(): void {
    var device = this.editingDevice;
    const dialogRef = this._dialog.open(UnclaimDialog, {
      data: device
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        var body = {
          host: this.host,
          cookies: this.cookies,
          headers: this.headers,
          role: this.role,
          org_id: this.org_id,
          site_name: this.site_name,
          map_id: this.map_id,
          device_mac: device.mac

        }
        this._http.post<any>('/api/devices/unclaim/', body).subscribe({
          next: data => {
            this.editingDevice = null;
            this.getDevices()
            this.openSnackBar("Device " + device.mac + " successfully deleted", "Done")
          },
          error: error => {
            var message: string = "Unable to delete the device " + device.mac + "... "
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

