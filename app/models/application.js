const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Application', applicationSchema)
