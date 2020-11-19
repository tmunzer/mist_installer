import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { MatPaginator } from '@angular/material/paginator';

import { ClaimDialog } from '../common/common-claim';
import { UnclaimDialog } from '../common/common-unclaim';
import { ErrorDialog } from '../common/common-error';

import * as L from 'leaflet';

import { ConnectorService } from '../connector.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export interface DeviceElement {
  mac: string;
  model: string;
  serial: string;
  connected: boolean;
  type: string;
  deviceprofile_name: string;
  height: Int16Array;
  map_id: string;
  map_name: string;
  name: string;
  orientation: Int16Array;
  site_id: string;
  site_name: string;
  x: Int16Array;
  y: Int16Array;
  isLocating: boolean;
}

export interface MapElement {
  width_m: number,
  name: string,
  width: number,
  height_m: number,
  ppm: number,
  height: number,
  type: string,
  url: string,
  thumbnail_url: string
}

export interface MistDevices {
  results: DeviceElement[];
  total: number;
  limiit: number;
  page: number;
}


@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.css']
})


export class SiteComponent implements OnInit {

  private floorplan;
  hideFloorplan: boolean = true;

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
  site_name: string = "__any__";
  map_id: string = "__any__";
  device_type: string = ""
  me: string = "";
  map: MapElement;

  claimButton: string = "To Site";

  topBarLoading = false;
  loading = false;


  filteredDevicesDatase: MatTableDataSource<DeviceElement> | null;
  devices: DeviceElement[] = []

  resultsLength = 0;
  displayedColumns: string[] = ['device']

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _http: HttpClient, private _appService: ConnectorService, public _dialog: MatDialog, private _snackBar: MatSnackBar) { }

  ngOnInit() {
    this.hideFloorplan = false;
    this.initMap()
    this._appService.headers.subscribe(headers => this.headers = headers)
    this._appService.cookies.subscribe(cookies => this.cookies = cookies)
    this._appService.host.subscribe(host => this.host = host)
    this._appService.self.subscribe(self => this.self = self || {})
    this._appService.org_id.subscribe(org_id => this.org_id = org_id)
    this._appService.sites.subscribe(sites => this.sites = sites)
    this._appService.site_name.subscribe(site_name => this.site_name = site_name)
    this._appService.role.subscribe(role => this.role = role)

    this.getDevices();
    if (this.site_name) {
      this.getMaps();
    }
  }


  getDevices() {
    var body = null
    if (this.site_name == "__any__" || this.site_name == "") {
      body = { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, full: true, type: this.device_type, role: this.role }
    } else if (this.site_name) {
      body = { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, site_name: this.site_name, full: true, type: this.device_type, role: this.role }
    }
    if (body) {
      this.loading = true;
      this._http.post<DeviceElement[]>('/api/devices/', body).subscribe({
        next: data => {
          console.log(data)
          var tmp: DeviceElement[] = []
          data["results"].forEach(element => {
            if (element.site_name == this.site_name && (this.map_id == "__any__" || element.map_id == this.map_id)) {
              tmp.push(element)
            }
          });
          this.filteredDevicesDatase = new MatTableDataSource(tmp);

          this.filteredDevicesDatase.paginator = this.paginator;
          this.loading = false;
        },
        error: error => {
          var message: string = "There was an error... "
          if ("error" in error) { message += error["error"]["message"] }
          this.openError(message)
        }
      })

    }
  }

  getMaps() {
    this.topBarLoading = true;
    this._http.post<any>('/api/maps/', { host: this.host, cookies: this.cookies, headers: this.headers, org_id: this.org_id, site_name: this.site_name, role: this.role }).subscribe({
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
      this.maps = this.sortList(data.maps, "name");
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

  locate(device: DeviceElement): void {
    if (device.isLocating == true) {
      this._http.post<any>('/api/devices/unlocate/', { host: this.host, cookies: this.cookies, headers: this.headers, role: this.role, org_id: this.org_id, device_mac: device.mac }).subscribe({
        next: data => device.isLocating = false,
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
        next: data => device.isLocating = true,
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

  // MAP
  private initMap(): void {
    this.floorplan = L.map('map', {
      crs: L.CRS.Simple,
      //center: [-this.map.height/2, -this.map.width/2],
      minZoom:-10,
      maxZoom:5,
      zoomSnap: 0.5,
      maxBounds: [this.map.height, this.map.width]
    });
    var bounds = [[0, 0], [this.map.height, this.map.width]];
    var image = L.imageOverlay(this.map.url, bounds).addTo(this.floorplan);
    this.floorplan.panTo([this.map.height, this.map.width])
    this.floorplan.fitBounds(bounds);
    this.floorplan.on('click', function(e){
      console.log(e)
      var latlng = e.latlng;
      var x = latlng.lat;
      var y = latlng.lng;
      console.log("You clicked the map at x: " + x + " and y: " + y);
      });
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
      console.log(result)
      console.log(this.site_name)
      this.getDevices()
    })
  }

  // DELETE DIALOG
  openDelete(device: DeviceElement): void {
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
            this.getDevices()
            this.openSnackBar("Device " + device.mac + " successfully unprovisionned", "Done")
          },
          error: error => {
            var message: string = "Unable to unprovision the device " + device.mac + "... "
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

