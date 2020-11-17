import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { COMMA, ENTER, SPACE, SEMICOLON } from '@angular/cdk/keycodes';

export interface ClaimCodeElement {
    code: string;
    duplicated: boolean;
    valid: boolean;
    success: boolean;
    reason: string;
    readonly: boolean;
}

@Component({
    selector: 'dashboard-claim',
    templateUrl: 'dashboard-claim.html',
})
export class ClaimDialog {
    constructor(
        public dialogRef: MatDialogRef<ClaimDialog>) { }
    claimCodes: ClaimCodeElement[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA, SPACE, SEMICOLON];
    claimButtonDisabled: boolean = true;
    inputClaimCodes: string = "";    

    add(): void {
        var regex = /^[0-9a-z]{5}-?[0-9a-z]{5}-?[0-9a-z]{5}$/i;
        this.inputClaimCodes.split(/[\s,; ]+/).forEach(element => {
            var claim = element.replace(";", "").replace(",", "").trim().toUpperCase();
            if (claim.length > 0) {
                var newClaim = { code: claim, success: null, reason: null, duplicated: false, valid: false, readonly:true };
                if (claim.match(regex)) {
                    newClaim.valid = true;
                }
                this.claimCodes.forEach(element => {
                    if (element.code == newClaim.code){
                        element.duplicated = true;
                        newClaim.duplicated = true;
                    }
                })
                this.claimCodes.push(newClaim);
            }
        })
        this.check_issues();
        this.inputClaimCodes = "";
    }

    edit(claimCode: ClaimCodeElement): void {
        this.inputClaimCodes = claimCode.code;
        var index = this.claimCodes.indexOf(claimCode)
        this.claimCodes.splice(index, 1)
    }

    check_issues(): void {
        var issues = {
            invalid: [],
            duplicated: []
        };
        this.claimCodes.forEach(element => {
            if (element.valid == false) {
                issues.invalid.push(element.code);
            }
            if (element.duplicated == true) {
                issues.duplicated.push(element.code);
            }
        })
        if (this.claimCodes.length > 0 && issues.duplicated.length == 0 && issues.invalid.length == 0) {
            this.claimButtonDisabled = false;
        } else {
            this.claimButtonDisabled = true;
        }
    }

    remove(claimCode: ClaimCodeElement): void {    
        var duplicated_codes = []    ;
        var index = -1;
        // remove the claim code
        index = this.claimCodes.indexOf(claimCode);
        if (index >= 0) {
            this.claimCodes.splice(index, 1);
        }
        // if the removed claim code has the duplicated flag
        if (claimCode.duplicated){
            // find other same codes
            this.claimCodes.forEach(element => {
                if (element.code == claimCode.code) {
                    duplicated_codes.push(element);
                }        
            })
            // if only one other same code, remove the duplicated flash
            if (duplicated_codes.length == 1) {
                index = this.claimCodes.indexOf(duplicated_codes[0]);
                this.claimCodes[index].duplicated = false;
            }
        }
        // check issues for "claim" button
        this.check_issues()
    }

    confirm(): void {
        var claimCodesArray = [];
        this.claimCodes.forEach(element => {
            claimCodesArray.push(element.code)
        })
        this.dialogRef.close(claimCodesArray);
    }
    cancel(): void {
        this.dialogRef.close();
    }
}



