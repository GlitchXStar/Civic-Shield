import mongoose, { Schema, Document, Model } from 'mongoose';
import { CaseStatus, CaseStatusType } from '../constants/index.js';

export interface ICaseStatusHistory extends Document {
  _id: mongoose.Types.ObjectId;
  crimeReport: mongoose.Types.ObjectId;
  changedBy: mongoose.Types.ObjectId;
  previousStatus: CaseStatusType;
  newStatus: CaseStatusType;
  reason?: string;
  changedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CaseStatusHistorySchema: Schema<ICaseStatusHistory> = new Schema(
  {
    crimeReport: {
      type: Schema.Types.ObjectId,
      ref: 'CrimeReport',
      required: [true, 'Crime report reference is required'],
      index: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Changed by user reference is required'],
      index: true,
    },
    previousStatus: {
      type: String,
      enum: Object.values(CaseStatus),
      required: [true, 'Previous status is required'],
    },
    newStatus: {
      type: String,
      enum: Object.values(CaseStatus),
      required: [true, 'New status is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CaseStatusHistorySchema.index({ crimeReport: 1, changedAt: -1 });

export const CaseStatusHistory: Model<ICaseStatusHistory> =
  mongoose.models.CaseStatusHistory ||
  mongoose.model<ICaseStatusHistory>('CaseStatusHistory', CaseStatusHistorySchema);
export default CaseStatusHistory;
