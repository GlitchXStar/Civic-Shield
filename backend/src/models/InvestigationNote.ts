import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvestigationNote extends Document {
  _id: mongoose.Types.ObjectId;
  crimeReport: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  isInternalOnly: boolean;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InvestigationNoteSchema: Schema<IInvestigationNote> = new Schema(
  {
    crimeReport: {
      type: Schema.Types.ObjectId,
      ref: 'CrimeReport',
      required: [true, 'Crime report reference is required'],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author user reference is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      minlength: [2, 'Note content must be at least 2 characters long'],
    },
    isInternalOnly: {
      type: Boolean,
      default: true,
      required: true,
    },
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

InvestigationNoteSchema.index({ crimeReport: 1, createdAt: -1 });

export const InvestigationNote: Model<IInvestigationNote> =
  mongoose.models.InvestigationNote ||
  mongoose.model<IInvestigationNote>('InvestigationNote', InvestigationNoteSchema);
export default InvestigationNote;
