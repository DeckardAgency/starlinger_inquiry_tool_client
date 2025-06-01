import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MediaService } from '@services/http/media.service';
import { MediaItem } from '@models/media.model';
import { IconComponent } from '@shared/components/icon/icon.component';
import  { UploadedFile } from '@models/manual-cart-item.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent {
  @Input() files: UploadedFile[] = [];
  @Input() maxFileSize = 5 * 1024 * 1024; // 5MB default
  @Input() allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4'
  ];

  @Output() filesChanged = new EventEmitter<UploadedFile[]>();
  @Output() filePreviewRequested = new EventEmitter<UploadedFile>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isDragging = false;
  dragCounter = 0;

  constructor(private mediaService: MediaService) {}

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter++;
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragCounter--;

    if (this.dragCounter === 0) {
      this.isDragging = false;
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    this.dragCounter = 0;

    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  private handleFiles(fileList: FileList): void {
    Array.from(fileList).forEach(file => {
      if (!this.isValidFileType(file)) {
        alert(`File type not allowed: ${file.name}`);
        return;
      }

      if (file.size > this.maxFileSize) {
        alert(`File too large: ${file.name}. Maximum size is ${this.formatFileSize(this.maxFileSize)}.`);
        return;
      }

      const uploadedFile: UploadedFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: 'uploading',
        progress: 0
      };

      if (this.isImageFile(file.name)) {
        uploadedFile.previewUrl = URL.createObjectURL(file);
      }

      this.files.push(uploadedFile);
      this.uploadFile(uploadedFile);
    });
  }

  private isValidFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  private uploadFile(file: UploadedFile): void {
    const uploadSubscription = this.mediaService.uploadFile(file.file).subscribe({
      next: (event: HttpEvent<MediaItem>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              file.progress = Math.round((event.loaded / event.total) * 100);
            }
            break;

          case HttpEventType.Response:
            if (event.body) {
              file.status = 'success';
              file.progress = 100;
              file.mediaItem = event.body;
              this.emitFilesChanged();
            }
            break;
        }
      },
      error: (error) => {
        console.error('Upload failed:', error);
        file.status = 'error';
        file.progress = 0;

        if (error.status === 413) {
          file.errorMessage = 'File too large';
        } else if (error.status === 415) {
          file.errorMessage = 'Unsupported file type';
        } else if (error.status === 0) {
          file.errorMessage = 'Network error';
        } else {
          file.errorMessage = error.error?.message || 'Upload failed';
        }

        this.emitFilesChanged();
      },
      complete: () => {
        if (file.uploadSubscription) {
          file.uploadSubscription = undefined;
        }
      }
    });

    file.uploadSubscription = uploadSubscription;
  }

  removeFile(file: UploadedFile): void {
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    if (file.status === 'success' && file.mediaItem) {
      this.mediaService.deleteMediaItem(file.mediaItem.id).subscribe({
        error: (error) => console.error('Failed to delete file from server:', error)
      });
    }

    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }

    this.files = this.files.filter(f => f !== file);
    this.emitFilesChanged();
  }

  cancelUpload(file: UploadedFile): void {
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }
    this.removeFile(file);
  }

  retryUpload(file: UploadedFile): void {
    if (file.uploadSubscription && !file.uploadSubscription.closed) {
      file.uploadSubscription.unsubscribe();
    }

    file.status = 'uploading';
    file.progress = 0;
    file.errorMessage = undefined;

    this.uploadFile(file);
  }

  openImagePreview(file: UploadedFile): void {
    if (this.isImageFile(file.name) && file.previewUrl && file.status === 'success') {
      this.filePreviewRequested.emit(file);
    }
  }

  hasSuccessfulUploads(): boolean {
    return this.files.some(file => file.status === 'success');
  }

  hasUploadsInProgress(): boolean {
    return this.files.some(file => file.status === 'uploading');
  }

  getSuccessfulUploadCount(): number {
    return this.files.filter(file => file.status === 'success').length;
  }

  isImageFile(fileName: string): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  private emitFilesChanged(): void {
    this.filesChanged.emit([...this.files]);
  }

  ngOnDestroy(): void {
    this.files.forEach(file => {
      if (file.uploadSubscription && !file.uploadSubscription.closed) {
        file.uploadSubscription.unsubscribe();
      }
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
  }
}
