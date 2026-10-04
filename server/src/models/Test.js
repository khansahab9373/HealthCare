import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sampleType: {
      type: String,
      required: true,
    },
    preparationInstructions: {
      type: String,
      required: true,
    },
    fastingRequired: {
      type: Boolean,
      default: false,
    },
    fastingDuration: {
      type: String,
      default: 'N/A',
    },
    estimatedReportTime: {
      type: String,
      required: true,
    },
    homeCollectionAvailable: {
      type: Boolean,
      default: true,
    },
    labVisitAvailable: {
      type: Boolean,
      default: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Test = mongoose.model('Test', testSchema);

export default Test;
