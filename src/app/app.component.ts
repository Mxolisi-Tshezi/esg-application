import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardMembersBreakdown } from './models/boardcomposition.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['app.component.css']
})

export class AppComponent {
  boardMembersBreakdown: BoardMembersBreakdown = {
    totalboardmembers: 0,
    black: { percent: 0, count: 0 },
    white: { percent: 0, count: 0 },
    indian: { percent: 0, count: 0 },
    asian: { percent: 0, count: 0 },
    coloured: { percent: 0, count: 0 },
    below30: { percent: 0, count: 0 },
    between30And50: { percent: 0, count: 0 },
    female: { percent: 0, count: 0 },
    male: { percent: 0, count: 0 },
    over50: { percent: 0, count: 0 },
    boardprofile: '',
  }
  steps = ['Governance', 'Social', 'Environmental', 'Generate Report'];
  activeStepIndex = 0;

  tabs = ['Board composition', 'Ethical behaviour', 'Compliance and risk management', 'Tax transparency'];
  activeTabIndex = 0;

  formData = this.boardMembersBreakdown;

  

  goToStep(index: number) {
    this.activeStepIndex = index;
    this.activeTabIndex = 0;
    localStorage.setItem('formData', JSON.stringify(this.formData));
  }

  goToTab(index: number) {
    this.activeTabIndex = index;
  }
}
