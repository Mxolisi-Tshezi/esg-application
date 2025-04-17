import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

export interface ReportSettings {
    companyName: string;
    reportYear: string;
}

@Component({
    selector: 'app-report-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card mb-4">
      <div class="card-header bg-light">
        <h5 class="mb-0">Report Settings</h5>
      </div>
      <div class="card-body">
        <form (ngSubmit)="saveSettings()">
          <div class="mb-3">
            <label for="companyName" class="form-label">Company Name</label>
            <input 
              type="text" 
              class="form-control" 
              id="companyName" 
              [(ngModel)]="settings.companyName"
              name="companyName"
              required
            >
          </div>
          <div class="mb-3">
            <label for="reportYear" class="form-label">Report Year</label>
            <input 
              type="text" 
              class="form-control" 
              id="reportYear" 
              [(ngModel)]="settings.reportYear"
              name="reportYear"
              required
            >
          </div>
          <button type="submit" class="btn btn-primary">Save Settings</button>
        </form>
      </div>
    </div>
  `,
    styles: []
})
export class ReportSettingsComponent {
    @Output() settingsChanged = new EventEmitter<ReportSettings>();

    settings: ReportSettings = {
        companyName: environment.companyName,
        reportYear: environment.reportYear
    };

    saveSettings() {
        this.settingsChanged.emit(this.settings);
    }
}