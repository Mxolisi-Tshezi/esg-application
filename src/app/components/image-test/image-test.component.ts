// src/app/components/image-test/image-test.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpenAIService } from '../../services/opeanai.service';

@Component({
    selector: 'app-image-test',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Image Generation Test</h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label for="prompt" class="form-label">Test Prompt</label>
          <textarea 
            class="form-control" 
            id="prompt" 
            rows="3" 
            [(ngModel)]="prompt"
            placeholder="Enter a prompt for image generation"
          ></textarea>
        </div>
        
        <div class="d-flex gap-2 mb-3">
          <button 
            class="btn btn-primary" 
            (click)="testGeneration()" 
            [disabled]="isGenerating">
            {{ isGenerating ? 'Generating...' : 'Test Generation' }}
          </button>
          <button 
            class="btn btn-outline-secondary" 
            (click)="clearResults()"
            [disabled]="isGenerating">
            Clear Results
          </button>
        </div>
        
        <div *ngIf="isGenerating" class="alert alert-info">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Generating image... This may take a moment.
        </div>
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          <strong>Error:</strong> {{ errorMessage }}
        </div>
        
        <div *ngIf="generatedImageUrl" class="text-center mt-3">
          <h6>Generated Image:</h6>
          <img 
            [src]="generatedImageUrl" 
            alt="Generated from prompt" 
            class="img-fluid border rounded" 
            style="max-height: 400px;"
          />
        </div>
        
        <div *ngIf="apiResponse" class="mt-3">
          <h6>API Response:</h6>
          <pre class="bg-light p-3 rounded small">{{ apiResponse | json }}</pre>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class ImageTestComponent {
    prompt: string = 'A simple test image of a blue circle on a white background';
    isGenerating: boolean = false;
    generatedImageUrl: string | null = null;
    errorMessage: string | null = null;
    apiResponse: any = null;

    constructor(private openAIService: OpenAIService) { }

    testGeneration() {
        if (!this.prompt || this.prompt.trim() === '') {
            this.errorMessage = 'Please enter a prompt for image generation';
            return;
        }

        this.isGenerating = true;
        this.errorMessage = null;
        this.generatedImageUrl = null;
        this.apiResponse = null;

        this.openAIService.generateImage(this.prompt).subscribe({
            next: (imageUrl) => {
                this.generatedImageUrl = imageUrl;
                this.isGenerating = false;
                this.apiResponse = { success: true, imageUrl };
            },
            error: (error) => {
                this.isGenerating = false;
                this.errorMessage = error.message || 'An unknown error occurred';
                this.apiResponse = {
                    success: false,
                    error: error.message,
                    details: error
                };
                console.error('Image generation test error:', error);
            }
        });
    }

    clearResults() {
        this.generatedImageUrl = null;
        this.errorMessage = null;
        this.apiResponse = null;
    }
}