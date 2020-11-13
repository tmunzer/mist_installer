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
    claimButtonEnabled: boolean = false;


    add(event: MatChipInputEvent): void {
        console.log(event)
        const input = event.input;
        const value = event.value;
        //        claimCodes: ["", Validators.required, Validators.pattern('[[:alnum:]]{5}[-]*[[:alnum:]]{5}[-]*[[:alnum:]]{5}')]

        // Add our fruit
        if ((value || '').trim()) {
            this.claimCodes.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
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



