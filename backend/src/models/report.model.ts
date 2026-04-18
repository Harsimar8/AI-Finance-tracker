import mongoose from "mongoose";

export enum ReportStatusEnum{
    SENT = "SENT",
    PENDING = "PENDING",
    FAILED = "FAILED",
    NO_ACTIVITY = "NO_ACTIVITY",
}

export interface ReportDocument extends Document{
    userId: mongoose.Types.ObjectId;
    period: string;
    sentDate: Date;
    ststus: keyof typeof ReportStatusEnum;
    createdAt: Date;
    updatedAt: Date;
}

const reportSchema = new mongoose.Schema<ReportDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    period:{
        type: String,
        reuired: true,
    },
    sentDate:{
        type: Date,
        required: Date,
    },
    status:{
        type: String,
        enum: Object.values(ReportStatusEnum),
        defaultn: ReportStatusEnum.PENDING,
    },
},
{
    timestamps: true,
});

const ReportModel = mongoose.model<ReportDocument>("Reprt", reportSchema);
export default ReportModel;