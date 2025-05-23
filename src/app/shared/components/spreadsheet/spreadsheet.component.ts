import { Component, OnInit } from '@angular/core';
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
  activeTab: TabType = 'client';
  statusMessage: string = '';
  isSuccess: boolean = false;
  isExpanded: boolean = false;

  demoData: SpreadsheetRow[] = [
    {
      id: 1,
      productName: 'Part One demo name',
      shortDescription: 'Part One demo description',
      additionalNotes: 'Part One Additional notes'
    },
    {
      id: 2,
      productName: 'Part Two demo name',
      shortDescription: 'Part Two demo description',
      additionalNotes: 'Part Two Additional notes'
    },
    {
      id: 3,
      productName: 'Part Three demo name',
      shortDescription: 'Part Three demo description',
      additionalNotes: 'Part Three Additional notes'
    }
  ];

  clientData: SpreadsheetRow[] = [];

  ngOnInit(): void {
    this.initializeClientData();
    this.clearStatusMessage();
  }

  /**
   * Initialize client data with 100 empty rows
   */
  private initializeClientData(): void {
    this.clientData = [];
    for (let i = 1; i <= 100; i++) {
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

    // Add data entries
    data.forEach((row, index) => {
      if (row.productName || row.shortDescription || row.additionalNotes) {
        exportData.push(['Product (part) name', row.productName]);
        exportData.push(['Short description', row.shortDescription]);
        exportData.push(['Additional notes', row.additionalNotes]);

        // Add empty row between groups (except for the last entry)
        if (index < data.length - 1) {
          exportData.push([]);
        }
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
}
