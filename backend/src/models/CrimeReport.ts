import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  CaseStatus,
  CaseStatusType,
  CrimeCategory,
  CrimeCategoryType,
  Priority,
  PriorityType,
  ContactMethod,
  ContactMethodType,
} from '../constants/index.js';

export interface IGeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  formattedAddress: string;
  city: string;
  state: string;
  pincode?: string;
}

export interface ICrimeReport extends Document {
  _id: mongoose.Types.ObjectId;
  trackingId: string;
  submittedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId | null;
  category: CrimeCategoryType;
  title: string;
  description: string;
  incidentDate: Date;
  location: IGeoLocation;
  status: CaseStatusType;
  priority: PriorityType;
  contactPreference: ContactMethodType;
  isAnonymous: boolean;
  evidenceFiles: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GeoLocationSchema = new Schema<IGeoLocation>(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (val: number[]) {
          return val.length === 2 && val[0] >= -180 && val[0] <= 180 && val[1] >= -90 && val[1] <= 90;
        },
        message: 'Coordinates must be valid [longitude, latitude] array',
      },
    },
    formattedAddress: {
      type: String,
      required: [true, 'Formatted address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const CrimeReportSchema: Schema<ICrimeReport> = new Schema(
  {
    trackingId: {
      type: String,
      required: [true, 'Tracking ID is required'],
      unique: true,
      trim: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitted by user reference is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(CrimeCategory),
      required: [true, 'Crime category is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
    },
    location: {
      type: GeoLocationSchema,
      required: [true, 'Location data is required'],
    },
    status: {
      type: String,
      enum: Object.values(CaseStatus),
      default: CaseStatus.SUBMITTED,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
      required: true,
      index: true,
    },
    contactPreference: {
      type: String,
      enum: Object.values(ContactMethod),
      default: ContactMethod.EMAIL,
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    evidenceFiles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Evidence',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
CrimeReportSchema.index({ 'location.coordinates': '2dsphere' });
CrimeReportSchema.index({ createdAt: -1 });

export const CrimeReport: Model<ICrimeReport> =
  mongoose.models.CrimeReport || mongoose.model<ICrimeReport>('CrimeReport', CrimeReportSchema);
export default CrimeReport;
