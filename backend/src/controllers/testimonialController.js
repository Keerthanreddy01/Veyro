const Testimonial = require('../models/Testimonial');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

// Curated platform testimonials as rich baseline
const DEFAULT_CURATED_TESTIMONIALS = [
  {
    _id: 'curated-alex',
    name: 'Alex Rivera',
    occupation: 'Learner — Full-Stack Systems',
    testimonial: 'The 90% watch threshold ensured I actually absorbed every lesson before attempting the quiz. Receiving the cryptographic certificate at the end felt genuinely earned.',
    rating: 5,
    profilePicture: '/testimonials/Aria Minaei.png',
    status: 'approved',
    createdAt: new Date('2026-09-01T10:00:00Z'),
  },
  {
    _id: 'curated-marcus',
    name: 'Dr. Marcus Chen',
    occupation: 'Instructor — Distributed Cloud Systems',
    testimonial: 'As an instructor, authoring video modules and proctored quizzes in Veyro is effortless. The tab-focus monitoring eliminates any doubt during grading.',
    rating: 5,
    profilePicture: '/testimonials/Ant Wilson.png',
    status: 'approved',
    createdAt: new Date('2026-09-05T12:00:00Z'),
  },
  {
    _id: 'curated-priya',
    name: 'Priya Sharma',
    occupation: 'Graduate — DevOps & SRE',
    testimonial: 'Being able to verify my certificate instantly using the public verification code gave me a huge advantage when applying for senior engineering roles.',
    rating: 5,
    profilePicture: '/testimonials/Kent C. Dodds.png',
    status: 'approved',
    createdAt: new Date('2026-09-12T15:30:00Z'),
  },
  {
    _id: 'curated-elena',
    name: 'Elena Rostova',
    occupation: 'Student — Cybersecurity & Cryptography',
    testimonial: 'Veyro sets a benchmark for modern educational software. Clean, fast, dark mode aesthetics with non-invasive browser proctoring.',
    rating: 5,
    profilePicture: '/testimonials/Guillermo Rauch.png',
    status: 'approved',
    createdAt: new Date('2026-09-18T09:15:00Z'),
  },
];

/**
 * GET /api/testimonials
 * Public endpoint: Returns approved testimonials for the landing page showcase.
 */
const getPublicTestimonials = async (req, res, next) => {
  try {
    const dbApproved = await Testimonial.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .lean();

    // If database has user-approved testimonials, display them first followed by baseline
    const combined = [...dbApproved];
    for (const curated of DEFAULT_CURATED_TESTIMONIALS) {
      if (!combined.some((t) => t.name.toLowerCase() === curated.name.toLowerCase())) {
        combined.push(curated);
      }
    }

    res.json({
      success: true,
      testimonials: combined,
      count: combined.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/testimonials
 * Public endpoint: Audience / learners submit a review for administrator moderation.
 */
const submitTestimonial = async (req, res, next) => {
  try {
    const { name, occupation, testimonial, rating } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Your name is required.' });
    }

    if (!testimonial || testimonial.trim().length < 10) {
      return res.status(400).json({ error: 'Testimonial content must be at least 10 characters long.' });
    }

    const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    const newTestimonial = await Testimonial.create({
      name: name.trim(),
      occupation: (occupation || '').trim() || 'Veyro Learner',
      testimonial: testimonial.trim(),
      rating: numericRating,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted for administrator review.',
      testimonial: newTestimonial,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/testimonials
 * Admin-only: Fetch all testimonials with status filtering and pagination.
 */
const getAdminTestimonials = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const testimonials = await Testimonial.find(filter)
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    const counts = {
      pending: await Testimonial.countDocuments({ status: 'pending' }),
      approved: await Testimonial.countDocuments({ status: 'approved' }),
      rejected: await Testimonial.countDocuments({ status: 'rejected' }),
      total: await Testimonial.countDocuments(),
    };

    res.json({
      success: true,
      testimonials,
      counts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/testimonials/:id/status
 * Admin-only: Approve or Reject a submitted testimonial.
 */
const reviewAdminTestimonial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved', 'rejected', or 'pending'." });
    }

    const item = await Testimonial.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }

    item.status = status;
    item.reviewedBy = req.user.userId;
    item.reviewedAt = new Date();
    await item.save();

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.TESTIMONIAL_MODERATED,
      entityType: 'testimonial',
      entityId: item._id,
      metadata: {
        authorName: item.name,
        newStatus: status,
      },
    });

    res.json({
      success: true,
      message: `Testimonial successfully marked as ${status}.`,
      testimonial: item,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/testimonials/:id
 * Admin-only: Delete a testimonial.
 */
const deleteAdminTestimonial = async (req, res, next) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }

    await logAudit({
      req,
      actorId: req.user.userId,
      actorRole: req.user.role,
      action: AUDIT_ACTIONS.TESTIMONIAL_MODERATED,
      entityType: 'testimonial',
      entityId: req.params.id,
      metadata: { deleted: true, authorName: item.name },
    });

    res.json({ success: true, message: 'Testimonial deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/testimonials
 * Admin-only: Create an official/curated testimonial directly.
 */
const createAdminTestimonial = async (req, res, next) => {
  try {
    const { name, occupation, testimonial, rating, status } = req.body;
    if (!name || !testimonial) {
      return res.status(400).json({ error: 'Name and testimonial are required.' });
    }

    const created = await Testimonial.create({
      name: name.trim(),
      occupation: (occupation || 'Veyro Learner').trim(),
      testimonial: testimonial.trim(),
      rating: Math.max(1, Math.min(5, parseInt(rating, 10) || 5)),
      status: status || 'approved',
      reviewedBy: req.user.userId,
      reviewedAt: new Date(),
    });

    res.status(201).json({ success: true, testimonial: created });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPublicTestimonials,
  submitTestimonial,
  getAdminTestimonials,
  reviewAdminTestimonial,
  deleteAdminTestimonial,
  createAdminTestimonial,
  DEFAULT_CURATED_TESTIMONIALS,
};
