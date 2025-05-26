import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { SpreadsheetRow, TabType, ExportOptions } from './spreadsheet.interface';

@Component({
  selector: 'app-spreadsheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.scss']
})
export class SpreadsheetComponent implements OnInit {
  @Output() dataChanged = new EventEmitter<SpreadsheetRow[]>();

  activeTab: TabType = 'client';
  statusMessage: string = '';
  isSuccess: boolean = false;
  isExpanded: boolean = false;

  demoData: SpreadsheetRow[] = [
    {
      id: 1,
      productName: 'Power panel T30 4,3" WQVGA color touch',
      shortDescription: 'Hello! I need a replacement part for my 200XE Winding Machine. Not sure about the exact part needed, please check the attached files for more info.',
      additionalNotes: 'Please get back to us ASAP, we need this part urgent, production stopped!'
    },
    {
      id: 2,
      productName: 'Control Unit CU-500',
      shortDescription: 'Need replacement control unit for the extrusion line. Current unit showing error codes.',
      additionalNotes: 'Error codes: E101, E205. Machine serial: EX-2019-0456'
    },
    {
      id: 3,
      productName: 'Servo Motor SM-200',
      shortDescription: 'Servo motor for winding station 3 needs replacement due to overheating issues.',
      additionalNotes: 'Motor specifications: 200W, 3000RPM, 24V DC'
    }
  ];

  clientData: SpreadsheetRow[] = [];

  ngOnInit(): void {
    this.initializeClientData();
    this.clearStatusMessage();
    // Emit initial data
    this.emitData();
  }

  /**
   * Emit current data to parent component
   */
  private emitData(): void {
    const currentData = this.getCurrentData();
    // Filter out empty rows before emitting
    const filteredData = currentData.filter(row =>
      row.productName || row.shortDescription || row.additionalNotes
    );
    this.dataChanged.emit(filteredData);
  }

  /**
   * Initialize client data with 25 product groups (each with 3 fields)
   */
  private initializeClientData(): void {
    this.clientData = [];
    // Create 25 product entries instead of 100 separate rows
    for (let i = 1; i <= 25; i++) {
      this.clientData.push({
        id: i,
        productName: '',
        shortDescription: '',
        additionalNotes: ''
      });
    }
  }

  /**
   * Switch between demo and client data tabs
   */
  switchTab(tab: TabType): void {
    this.activeTab = tab;
    this.clearStatusMessage();

    // If switching to demo tab and it's using the demo data, emit it immediately
    if (tab === 'demo') {
      console.log('Switched to demo tab, emitting demo data:', this.demoData);
    }

    this.emitData();
  }

  /**
   * Get current data based on active tab
   */
  getCurrentData(): SpreadsheetRow[] {
    return this.activeTab === 'demo' ? this.demoData : this.clientData;
  }

  /**
   * Clear all client data
   */
  clearData(): void {
    if (this.activeTab === 'client') {
      this.initializeClientData();
      this.showStatusMessage('Client data cleared successfully!', true);
      this.emitData();
    }
  }

  /**
   * Export current data to Excel file
   */
  exportToExcel(options: ExportOptions = {}): void {
    try {
      const currentData = this.getCurrentData();
      const dataToExport = this.prepareExportData(currentData);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(dataToExport);

      // Set column widths for better formatting
      ws['!cols'] = [
        { width: 20 },
        { width: 30 },
        { width: 50 }
      ];

      // Add worksheet to workbook
      const sheetName = options.sheetName || 'Starlinger Parts Request';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename
      const filename = this.generateFilename(options);

      // Save file
      XLSX.writeFile(wb, filename);

      this.showStatusMessage(`Excel file "${filename}" exported successfully!`, true);
    } catch (error) {
      console.error('Export failed:', error);
      this.showStatusMessage('Failed to export Excel file. Please try again.', false);
    }
  }

  /**
   * Prepare data for Excel export
   */
  private prepareExportData(data: SpreadsheetRow[]): any[][] {
    const exportData: any[][] = [];

    // Add header
    exportData.push(['Starlinger Part Request Template']);
    exportData.push([]);

    // Add data entries - filter out completely empty entries
    const nonEmptyData = data.filter(row =>
      row.productName || row.shortDescription || row.additionalNotes
    );

    nonEmptyData.forEach((row, index) => {
      exportData.push(['Product (part) name', row.productName]);
      exportData.push(['Short description', row.shortDescription]);
      exportData.push(['Additional notes', row.additionalNotes]);

      // Add empty row between groups (except for the last entry)
      if (index < nonEmptyData.length - 1) {
        exportData.push([]);
      }
    });

    return exportData;
  }

  /**
   * Generate filename for export
   */
  private generateFilename(options: ExportOptions): string {
    const baseFilename = options.filename || 'Starlinger_Parts_Request';
    const tabSuffix = this.activeTab;

    if (options.includeTimestamp !== false) {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      return `${baseFilename}_${tabSuffix}_${timestamp}.xlsx`;
    }

    return `${baseFilename}_${tabSuffix}.xlsx`;
  }

  /**
   * Show status message with auto-clear
   */
  private showStatusMessage(message: string, success: boolean): void {
    this.statusMessage = message;
    this.isSuccess = success;
    setTimeout(() => this.clearStatusMessage(), 5000);
  }

  /**
   * Toggle expanded/fullscreen view
   */
  toggleExpandedView(): void {
    this.isExpanded = !this.isExpanded;
    this.showStatusMessage(
      this.isExpanded ? 'Expanded to full view' : 'Returned to compact view',
      true
    );
  }

  /**
   * Clear status message
   */
  private clearStatusMessage(): void {
    this.statusMessage = '';
    this.isSuccess = false;
  }

  /**
   * Handle data changes
   */
  onDataChange(): void {
    // Use setTimeout to ensure the model is updated before emitting
    setTimeout(() => {
      this.emitData();
    }, 0);
  }
}
