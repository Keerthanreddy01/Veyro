const router = require('express').Router();
const { getPublicTestimonials, submitTestimonial } = require('../controllers/testimonialController');

// Public endpoints (no authentication required)
router.get('/', getPublicTestimonials);
router.post('/', submitTestimonial);

module.exports = router;
