const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, courseController.getAllCourses);
router.get('/:id', authMiddleware, courseController.getCourseById);
router.post('/', authMiddleware, courseController.createCourse);
router.put('/:id', authMiddleware, courseController.updateCourse);
router.put('/:id/archive', authMiddleware, courseController.archiveCourse);
router.delete('/:id', authMiddleware, courseController.deleteCourse);

module.exports = router;

