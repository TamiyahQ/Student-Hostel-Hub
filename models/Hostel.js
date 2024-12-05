import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  rooms: [{
    roomNumber: String,
    type: String,
    capacity: Number,
    price: Number,
    available: {
      type: Boolean,
      default: true
    }
  }],
  amenities: [String],
  description: String,
  rules: [String],
  contactInfo: {
    phone: String,
    email: String
  },
  images: [String]
}, { timestamps: true });

export default mongoose.model('Hostel', hostelSchema);