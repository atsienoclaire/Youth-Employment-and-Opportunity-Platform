const express = require('express');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all jobs with filtering
router.get('/', async (req, res) => {
  try {
    const { category, location, jobType, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (location) query.location = new RegExp(location, 'i');
    if (jobType) query.jobType = jobType;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { company: new RegExp(search, 'i') }
      ];
    }

    const jobs = await Job.find(query)
      .populate('employer', 'name company')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name company');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create job (Employers only)
router.post('/', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      employer: req.user._id
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update job (Employer who created it or Admin)
router.put('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is employer who created the job or admin
    if (job.employer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Apply for job (Job Seekers only)
router.post('/:id/apply', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.find(
      app => app.jobSeeker.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied for this job' });
    }

    job.applications.push({
      jobSeeker: req.user._id,
      resume: req.body.resume,
      coverLetter: req.body.coverLetter
    });

    await job.save();
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;