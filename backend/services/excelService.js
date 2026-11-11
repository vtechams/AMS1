const ExcelJS = require('exceljs');
const fs = require('fs');
const mongoose = require('mongoose');
const config = require('../config/config');
const models = require('../models');
const excelSyncService = require('./excelSyncService');

class UnifiedDatabaseService {
  constructor() {
    this.dbPath = config.DB_PATH;
    this.backupDir = config.BACKUP_DIR;

    // Entity Sheet configurations
    this.entityConfig = {
      Students: { model: models.Students, idField: 'student_id', prefix: 'STU', startNum: 1001, statusField: 'student_status' },
      Courses: { model: models.Courses, idField: 'course_id', prefix: 'CRS', startNum: 101, statusField: 'course_status' },
      Batches: { model: models.Batches, idField: 'batch_id', prefix: 'BAT', startNum: 201, statusField: 'batch_status' },
      Enrollments: { model: models.Enrollments, idField: 'enrollment_id', prefix: 'ENR', startNum: 301, statusField: 'enrollment_status' },
      Companies: { model: models.Companies, idField: 'company_id', prefix: 'CMP', startNum: 401, statusField: 'status' },
      Requirements: { model: models.Requirements, idField: 'requirement_id', prefix: 'REQ', startNum: 501, statusField: 'requirement_status' },
      Applications: { model: models.Applications, idField: 'application_id', prefix: 'APP', startNum: 601, statusField: 'result' },
      Attendance: { model: models.Attendance, idField: 'attendance_id', prefix: 'ATT', startNum: 701, statusField: 'attendance_status' },
      HR_Followups: { model: models.HR_Followups, idField: 'followup_id', prefix: 'FLW', startNum: 801, statusField: 'status' },
      Admin: { model: models.Admin, idField: 'admin_id', prefix: 'ADM', startNum: 1, statusField: 'status' }
    };
  }

  isMongoConnected() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  // Normalize column header to object key
  headerToKey(header) {
    if (!header) return '';
    return header
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s\-\/\(\)]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  formatCellValue(cell) {
    if (!cell || cell.value === null || cell.value === undefined) return '';
    if (typeof cell.value === 'object') {
      if (cell.value instanceof Date) return cell.value.toISOString().split('T')[0];
      if (cell.value.text) return cell.value.text;
      if (cell.value.result !== undefined) return cell.value.result.toString();
    }
    return cell.value.toString().trim();
  }

  async readFromExcelFile(sheetName) {
    if (!fs.existsSync(this.dbPath)) return [];
    const workbook = new ExcelJS.Workbook();
    const buffer = await fs.promises.readFile(this.dbPath);
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) return [];

    const headerRow = worksheet.getRow(1);
    const colMap = {};
    headerRow.eachCell((cell, colNumber) => {
      const key = this.headerToKey(cell.value);
      if (key) colMap[colNumber] = key;
    });

    const records = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record = {};
      let hasData = false;
      Object.entries(colMap).forEach(([colNum, key]) => {
        const val = this.formatCellValue(row.getCell(parseInt(colNum, 10)));
        record[key] = val;
        if (val) hasData = true;
      });
      if (hasData) records.push(record);
    });

    return records;
  }

  // Get all data for a specific sheet/collection as plain objects
  async getSheetData(sheetName) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    if (this.isMongoConnected()) {
      return await cfg.model.find({}).lean();
    }
    return await this.readFromExcelFile(sheetName);
  }

  // Find records matching optional filter function
  async find(sheetName, filterFn = null) {
    const records = await this.getSheetData(sheetName);
    if (!filterFn) return records;
    return records.filter(filterFn);
  }

  // Find single record by entity ID
  async findById(sheetName, id) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    if (this.isMongoConnected()) {
      return await cfg.model.findOne({ [cfg.idField]: id }).lean();
    }
    const records = await this.readFromExcelFile(sheetName);
    return records.find((r) => String(r[cfg.idField]).toLowerCase() === String(id).toLowerCase()) || null;
  }

  // Generate next sequential ID for entity
  generateNextId(records, cfg) {
    const { prefix, startNum, idField } = cfg;
    let maxNum = startNum - 1;

    for (const rec of records) {
      const idStr = rec[idField];
      if (idStr && idStr.startsWith(prefix)) {
        const numPart = parseInt(idStr.replace(`${prefix}-`, '').replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    }

    const nextNum = maxNum + 1;
    return `${prefix}-${nextNum}`;
  }

  // Insert a new record
  async insert(sheetName, data) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    const existingRecords = await this.getSheetData(sheetName);
    const newRecord = { ...data };

    if (!newRecord[cfg.idField]) {
      newRecord[cfg.idField] = this.generateNextId(existingRecords, cfg);
    }

    const now = new Date().toISOString();
    newRecord.created_at = newRecord.created_at || now;
    newRecord.updated_at = now;

    if (this.isMongoConnected()) {
      const doc = await cfg.model.create(newRecord);
      excelSyncService.triggerSync();
      return doc.toObject();
    }

    // Local Excel file fallback
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.dbPath);
    let worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) worksheet = workbook.addWorksheet(sheetName);

    const headerRow = worksheet.getRow(1);
    const colMap = {};
    headerRow.eachCell((cell, colNum) => {
      colMap[this.headerToKey(cell.value)] = colNum;
    });

    const newRow = worksheet.addRow([]);
    Object.entries(newRecord).forEach(([k, v]) => {
      if (colMap[k]) newRow.getCell(colMap[k]).value = v;
    });
    newRow.commit();
    await workbook.xlsx.writeFile(this.dbPath);

    return newRecord;
  }

  // Update record
  async update(sheetName, id, updates) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    const cleanUpdates = { ...updates };
    delete cleanUpdates[cfg.idField];
    delete cleanUpdates._id;
    delete cleanUpdates.__v;
    cleanUpdates.updated_at = new Date().toISOString();

    if (this.isMongoConnected()) {
      const updatedDoc = await cfg.model.findOneAndUpdate(
        { [cfg.idField]: id },
        { $set: cleanUpdates },
        { new: true }
      ).lean();

      if (!updatedDoc) {
        throw new Error(`Record with ID ${id} not found in ${sheetName}`);
      }
      excelSyncService.triggerSync();
      return updatedDoc;
    }

    // Local Excel file fallback
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.dbPath);
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Worksheet ${sheetName} not found`);

    let targetRow = null;
    const headerRow = worksheet.getRow(1);
    const colMap = {};
    let idColNum = null;

    headerRow.eachCell((cell, colNum) => {
      const k = this.headerToKey(cell.value);
      if (k) {
        colMap[k] = colNum;
        if (k === cfg.idField) idColNum = colNum;
      }
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (String(this.formatCellValue(row.getCell(idColNum))).toLowerCase() === String(id).toLowerCase()) {
        targetRow = row;
      }
    });

    if (!targetRow) throw new Error(`Record with ID ${id} not found in ${sheetName}`);

    Object.entries(cleanUpdates).forEach(([k, v]) => {
      if (colMap[k]) targetRow.getCell(colMap[k]).value = v;
    });
    targetRow.commit();
    await workbook.xlsx.writeFile(this.dbPath);

    return await this.findById(sheetName, id);
  }

  // Delete record
  async delete(sheetName, id) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    if (this.isMongoConnected()) {
      const res = await cfg.model.findOneAndDelete({ [cfg.idField]: id });
      if (!res) throw new Error(`Record with ID ${id} not found in ${sheetName}`);
      excelSyncService.triggerSync();
      return { success: true, message: `Record with ID ${id} deleted successfully` };
    }

    // Local Excel file fallback
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(this.dbPath);
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Worksheet ${sheetName} not found`);

    let targetRowNumber = null;
    const headerRow = worksheet.getRow(1);
    let idColNum = null;

    headerRow.eachCell((cell, colNum) => {
      if (this.headerToKey(cell.value) === cfg.idField) idColNum = colNum;
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (String(this.formatCellValue(row.getCell(idColNum))).toLowerCase() === String(id).toLowerCase()) {
        targetRowNumber = rowNumber;
      }
    });

    if (!targetRowNumber) throw new Error(`Record with ID ${id} not found in ${sheetName}`);

    worksheet.spliceRows(targetRowNumber, 1);
    await workbook.xlsx.writeFile(this.dbPath);

    return { success: true, message: `Record with ID ${id} deleted successfully` };
  }

  // Archive record (soft delete)
  async archive(sheetName, id) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`No config for sheet ${sheetName}`);
    return this.update(sheetName, id, { [cfg.statusField]: 'Archived' });
  }

  // Restore archived record
  async restore(sheetName, id, activeStatus = 'Active') {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`No config for sheet ${sheetName}`);
    return this.update(sheetName, id, { [cfg.statusField]: activeStatus });
  }

  // Export full workbook
  async exportFullWorkbook(res) {
    return await excelSyncService.streamFullWorkbook(res);
  }
}

module.exports = new UnifiedDatabaseService();
