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
  activeTab: TabType = 'demo';
  statusMessage: string = '';
  isSuccess: boolean = false;

  demoData: SpreadsheetRow = {
    id: 1,
    productName: 'Starlinger Recycling Extruder RE 100',
    shortDescription: 'High-performance recycling extruder for processing post-consumer plastic waste. Features advanced filtration system and energy-efficient design.',
    additionalNotes: 'Requires 380V power supply. Includes comprehensive training package and 2-year warranty. Installation support available.'
  };

  clientData: SpreadsheetRow = {
    id: 1,
    productName: '',
    shortDescription: '',
    additionalNotes: ''
  };

  ngOnInit(): void {
    this.clearStatusMessage();
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
  getCurrentData(): SpreadsheetRow {
    return this.activeTab === 'demo' ? this.demoData : this.clientData;
  }

  /**
   * Clear all client data
   */
  clearData(): void {
    if (this.activeTab === 'client') {
      this.clientData = {
        id: 1,
        productName: '',
        shortDescription: '',
        additionalNotes: ''
      };
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
  private prepareExportData(data: SpreadsheetRow): any[][] {
    const exportData: any[][] = [];

    // Add header
    exportData.push(['Starlinger Part Request Template']);
    exportData.push([]);

    // Add main data entry
    exportData.push(['Product (part) name', data.productName]);
    exportData.push(['Short description', data.shortDescription]);
    exportData.push(['Additional notes', data.additionalNotes]);

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
   * Clear status message
   */
  private clearStatusMessage(): void {
    this.statusMessage = '';
    this.isSuccess = false;
  }
}
