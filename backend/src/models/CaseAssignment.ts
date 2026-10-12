import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICaseAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  crimeReport: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  assignedAt: Date;
  unassignedAt?: Date | null;
  status: 'ACTIVE' | 'REASSIGNED' | 'COMPLETED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaseAssignmentSchema: Schema<ICaseAssignment> = new Schema(
  {
    crimeReport: {
      type: Schema.Types.ObjectId,
      ref: 'CrimeReport',
      required: [true, 'Crime report reference is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned officer user reference is required'],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned by user reference is required'],
    },
    assignedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    unassignedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'REASSIGNED', 'COMPLETED'],
      default: 'ACTIVE',
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

CaseAssignmentSchema.index({ crimeReport: 1, status: 1 });
CaseAssignmentSchema.index({ assignedTo: 1, status: 1 });

export const CaseAssignment: Model<ICaseAssignment> =
  mongoose.models.CaseAssignment || mongoose.model<ICaseAssignment>('CaseAssignment', CaseAssignmentSchema);
export default CaseAssignment;
