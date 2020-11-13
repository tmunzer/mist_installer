import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';


@Component({
    selector: 'dashboard-device',
    templateUrl: 'dashboard-device.html',
})

export class DeviceDialog {
    frmDevice = this.formBuilder.group({
        mac: [this.data.device.mac],
        model: [this.data.device.model],
        serial: [this.data.device.serial],
        connected: [this.data.device.connected],
        type: [this.data.device.type],
        deviceprofile_name: [this.data.device.deviceprofile_name],
        height: [this.data.device.height, Validators.min(0)],
        map_id: [this.data.device.map_id],
        name: [this.data.device.name],
        orientation: [this.data.device.orientation],
        site_id: [this.data.device.site_id],
        site_name: [this.data.device.site_name],
        x: [this.data.device.x],
        y: [this.data.device.y]
    });
    
    constructor(public dialogRef: MatDialogRef<DeviceDialog>, @Inject(MAT_DIALOG_DATA) public data, private formBuilder: FormBuilder) { }

    confirm() {
        this.dialogRef.close({device:this.frmDevice.value})
    }
    cancel(): void {
        this.dialogRef.close();
    }
}