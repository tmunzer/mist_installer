import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER, SPACE, SEMICOLON } from '@angular/cdk/keycodes';



@Component({
    selector: 'dashboard-claim',
    templateUrl: 'dashboard-claim.html',
})
export class ClaimDialog {
    constructor(
        public dialogRef: MatDialogRef<ClaimDialog>) { }
    claimCodes: string[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE, SEMICOLON];
    claimButtonDisabled: boolean = false;
    failed: string[] = [];
    failed_string: string = "";

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        this.failed = [];

        var regex = /^[0-9a-z]{5}-?[0-9a-z]{5}-?[0-9a-z]{5}$/i;
        value.split(" ").forEach(element => {
            var claim = element.replace(";", "").replace(",", "").trim();
            if (claim.match(regex)) {
                if (this.claimCodes.indexOf(claim) < 0) {
                    this.claimCodes.push(claim);
                }
            } else {
                this.failed.push(claim)
            }
        })

        this.failed_string = this.failed.join(', ');
        if (input) {
            input.value = this.failed.join(" ");
        }

        if (this.claimCodes && this.failed.length == 0) {
            this.claimButtonDisabled = false;
        } else {
            this.claimButtonDisabled = true;
        }
    }



    remove(claimCode: string): void {
        const index = this.claimCodes.indexOf(claimCode);
        if (index >= 0) {
            this.claimCodes.splice(index, 1);
        }
    }

    confirm(): void {
        var claimCodes: string[];
        console.log(claimCodes);
        this.dialogRef.close(claimCodes);
    }
    cancel(): void {
        this.dialogRef.close();
    }
}



