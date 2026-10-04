import mongoose, { Schema, Document, Model } from 'mongoose';

export type EvidenceFileType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'OTHER';

export interface IEvidence extends Document {
  _id: mongoose.Types.ObjectId;
  crimeReport: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  fileType: EvidenceFileType;
  fileSize: number;
  mimeType: string;
  hash?: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema: Schema<IEvidence> = new Schema(
  {
    crimeReport: {
      type: Schema.Types.ObjectId,
      ref: 'CrimeReport',
      required: [true, 'Crime report reference is required'],
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploaded by user reference is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'],
      default: 'OTHER',
      required: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: 0,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    hash: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// No explicit indexes needed since they are defined in schema fields

export const Evidence: Model<IEvidence> =
  mongoose.models.Evidence || mongoose.model<IEvidence>('Evidence', EvidenceSchema);
export default Evidence;
