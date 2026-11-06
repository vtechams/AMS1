const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/auth');

router.get('/export', authMiddleware, studentController.exportStudentsExcel);
router.get('/', authMiddleware, studentController.getAllStudents);
router.get('/:id', authMiddleware, studentController.getStudentById);
router.post('/', authMiddleware, studentController.createStudent);
router.put('/:id', authMiddleware, studentController.updateStudent);
router.put('/:id/archive', authMiddleware, studentController.archiveStudent);
router.put('/:id/restore', authMiddleware, studentController.restoreStudent);
router.delete('/:id', authMiddleware, studentController.deleteStudent);

module.exports = router;

