// manual-entry.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {BreadcrumbsComponent} from '../components/breadcrumbs/breadcrumbs.component';

interface Machine {
  id: string;
  name: string;
  image: string;
}

@Component({
  selector: 'app-manual-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbsComponent
  ],
  templateUrl: './manual-entry.component.html',
  styleUrls: ['./manual-entry.component.scss']
})
export class ManualEntryComponent implements OnInit {
  selectedMachineId: string | null = null;
  inquiryForm: FormGroup;

  breadcrumbs = [
    { label: 'Manual entry', link: '/manual-entry' },
    { label: 'Part 1' }
  ];

  machines: Machine[] = [
    {
      id: '200xe',
      name: '200XE Winding Machine',
      image: 'https://via.assets.so/img.jpg?w=126&h=224'
    },
    {
      id: 'starkon',
      name: 'ad*StarKON Machine',
      image: 'https://via.assets.so/img.jpg?w=126&h=224'
    },
    {
      id: 'starex',
      name: 'starEX Machine',
      image: 'https://via.assets.so/img.jpg?w=126&h=224'
    },
    {
      id: 'alpha',
      name: 'Alpha 6.0 Machine',
      image: 'https://via.assets.so/img.jpg?w=126&h=224'
    },
    {
      id: 'star1600',
      name: 'Star EX 1600 ES Machine',
      image: 'https://via.assets.so/img.jpg?w=126&h=224'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.inquiryForm = this.fb.group({
      partName: ['', Validators.required],
      description: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    // Initially disable the form
    this.inquiryForm.disable();
  }

  onMachineSelect() {
    if (this.selectedMachineId) {
      this.inquiryForm.enable();
    } else {
      this.inquiryForm.disable();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      console.log('Files dropped:', files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      console.log('Files selected:', input.files);
    }
  }

  onSaveDraft() {
    console.log('Saving draft:', this.inquiryForm.value);
  }

  onSubmit() {
    if (this.inquiryForm.valid) {
      console.log('Form submitted:', {
        machine: this.selectedMachineId,
        ...this.inquiryForm.value
      });
    }
  }
}
