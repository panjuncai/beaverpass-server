const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      "Living Room Furniture",
      "Bedroom Furniture",
      "Dining Room Furniture",
      "Office Furniture",
      "Outdoor Furniture",
      "Storage",
      "Other"
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 500
  },
  condition: {
    type: String,
    required: true,
    enum: ["Like New", "Gently Used", "Minor Scratches", "Stains", "Needs Repair"]
  },
  images: {
    FRONT: { type: String, required: true },
    SIDE: { type: String },
    BACK: { type: String },
    DAMAGE: { type: String }
  },
  price: {
    amount: {
      type: String,
      required: function() { return !this.price.isFree; }
    },
    isFree: {
      type: Boolean,
      default: false
    },
    isNegotiable: {
      type: Boolean,
      default: false
    }
  },
  delivery: {
    type: String,
    required: true,
    enum: ["Home Delivery", "Pickup", "Both"]
  },
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema); 