import mongoose, { Schema, Document, Model } from 'mongoose';
import { PoliceStatus, PoliceStatusType } from '../constants/index.js';

export interface IPoliceProfile extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  badgeNumber: string;
  rank: string;
  department: string;
  stationName: string;
  areaAssigned?: string;
  status: PoliceStatusType;
  shift?: string;
  casesAssignedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PoliceProfileSchema: Schema<IPoliceProfile> = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    badgeNumber: {
      type: String,
      required: [true, 'Badge number is required'],
      unique: true,
      trim: true,
    },
    rank: {
      type: String,
      required: [true, 'Rank is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    stationName: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    areaAssigned: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(PoliceStatus),
      default: PoliceStatus.AVAILABLE,
      required: true,
    },
    shift: {
      type: String,
      trim: true,
    },
    casesAssignedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

PoliceProfileSchema.index({ status: 1 });

export const PoliceProfile: Model<IPoliceProfile> =
  mongoose.models.PoliceProfile || mongoose.model<IPoliceProfile>('PoliceProfile', PoliceProfileSchema);
export default PoliceProfile;
