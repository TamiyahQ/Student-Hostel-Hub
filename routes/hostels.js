import express from 'express';
import { auth } from '../middleware/auth.js';
import Hostel from '../models/Hostel.js';

const router = express.Router();

// Public routes
router.get('/', async (req, res) => {
  try {
    const hostels = await Hostel.find().select('-owner');
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my hostels
router.get('/my-hostels', auth, async (req, res) => {
  try {
    const hostels = await Hostel.find({ owner: req.user.userId });
    res.json(hostels);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).select('-owner');
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
router.post('/', auth, async (req, res) => {
  try {
    const hostel = new Hostel({
      ...req.body,
      owner: req.user.userId
    });
    await hostel.save();
    res.status(201).json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    Object.assign(hostel, req.body);
    await hostel.save();
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ message: 'Hostel not added' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const hostel = await Hostel.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found' });
    }

    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;