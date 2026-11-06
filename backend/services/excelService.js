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

  // Get all data for a specific sheet/collection as plain objects
  async getSheetData(sheetName) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);
    return await cfg.model.find({}).lean();
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
    return await cfg.model.findOne({ [cfg.idField]: id }).lean();
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

  // Insert a new record into MongoDB Atlas & sync to Excel
  async insert(sheetName, data) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    const existingRecords = await cfg.model.find({}).lean();
    const newRecord = { ...data };

    if (!newRecord[cfg.idField]) {
      newRecord[cfg.idField] = this.generateNextId(existingRecords, cfg);
    }

    const now = new Date().toISOString();
    newRecord.created_at = newRecord.created_at || now;
    newRecord.updated_at = now;

    const doc = await cfg.model.create(newRecord);

    // Synchronize to Excel in background
    excelSyncService.triggerSync();

    return doc.toObject();
  }

  // Update record in MongoDB Atlas & sync to Excel
  async update(sheetName, id, updates) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    const cleanUpdates = { ...updates };
    delete cleanUpdates[cfg.idField];
    delete cleanUpdates._id;
    delete cleanUpdates.__v;
    cleanUpdates.updated_at = new Date().toISOString();

    const updatedDoc = await cfg.model.findOneAndUpdate(
      { [cfg.idField]: id },
      { $set: cleanUpdates },
      { new: true }
    ).lean();

    if (!updatedDoc) {
      throw new Error(`Record with ID ${id} not found in ${sheetName}`);
    }

    // Synchronize to Excel in background
    excelSyncService.triggerSync();

    return updatedDoc;
  }

  // Delete record from MongoDB Atlas & sync to Excel
  async delete(sheetName, id) {
    const cfg = this.entityConfig[sheetName];
    if (!cfg) throw new Error(`Unknown entity: ${sheetName}`);

    const res = await cfg.model.findOneAndDelete({ [cfg.idField]: id });
    if (!res) {
      throw new Error(`Record with ID ${id} not found in ${sheetName}`);
    }

    // Synchronize to Excel in background
    excelSyncService.triggerSync();

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
