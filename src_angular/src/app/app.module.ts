import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

import { GoogleMapsModule } from '@angular/google-maps';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TwoFactorDialog } from './login/login-2FA';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClaimDialog } from './dashboard/dashboard-claim';
import { UnclaimDialog } from './dashboard/dashboard-unclaim';
import { DeviceDialog } from './dashboard/dashboard-device';
import { ErrorDialog } from './dashboard/dashboard-error';
import { WarningDialog } from './dashboard/dashboard-warning';
import { ClaimDetailsDialog } from './dashboard/dashboard-claim-details';
import { OrgComponent } from './org/org.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent, TwoFactorDialog,
    DashboardComponent, ClaimDialog, UnclaimDialog, DeviceDialog, ErrorDialog, WarningDialog, ClaimDetailsDialog,
    OrgComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatButtonModule,
    MatChipsModule,
    MatSelectModule,
    MatInputModule,
    MatStepperModule,
    MatDividerModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatDialogModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  providers: [{
    provide: MatRadioModule,
    useValue: { color: 'accent' },
  }],
  bootstrap: [AppComponent]
})
export class AppModule {
  // Diagnostic only: inspect router configuration
  constructor(router: Router) {
    // Use a custom replacer to display function names in the route configs
    const replacer = (key, value) => (typeof value === 'function') ? value.name : value;
  }
}