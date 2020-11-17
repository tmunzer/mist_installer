import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

import { ErrorDialog } from './dashboard-error';

@Component({
    selector: 'dashboard-device',
    templateUrl: 'dashboard-device.html',
})

export class DeviceDialog {
    frmDevice = this.formBuilder.group({
        height: [this.data.device.height, Validators.min(0)],
        map_id: [this.data.device.map_id],
        name: [this.data.device.name],
        orientation: [this.data.device.orientation],
        site_name: [this.data.device.site_name],
        x: [this.data.device.x],
        y: [this.data.device.y]
    });

    constructor(private _http: HttpClient, public _dialog: MatDialog, public dialogRef: MatDialogRef<DeviceDialog>, @Inject(MAT_DIALOG_DATA) public data, private formBuilder: FormBuilder) { }

    topBarLoading: boolean = false;
    maps: string[] = []

    ngOnInit(): void {
        this.loadMaps();
    }

    changeSite(){
        this.frmDevice.patchValue({map_id: ""});
        this.loadMaps()
    }

    loadMaps() {
        if (this.frmDevice.value.site_name == "") {
            this.frmDevice.get("map_id").disable();
            this.maps = [];
        } else {
            this.frmDevice.get("map_id").enable();
            this.topBarLoading = true;
            this._http.post<any>('/api/maps/', { host: this.data.body.host, cookies: this.data.body.cookies, headers: this.data.body.headers, org_id: this.data.body.org_id, site_name: this.frmDevice.value.site_name }).subscribe({
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
    }

    parseMap(data) {
        if (data.maps.length > 0) {
            this.maps = this.sortList(data.maps, "name");
        }
        this.topBarLoading = false;
    }

    confirm() {
        this.dialogRef.close({ device: this.frmDevice.getRawValue(), device_mac: this.data.device.mac })
    }
    cancel(): void {
        this.dialogRef.close();
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