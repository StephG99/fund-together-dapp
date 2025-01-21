import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true, // Removes leading and trailing whitespace
    },
    description: {
        type: String,
        required: true,
    },
    creator: {
        type: String,
        required: true, // Wallet address of the creator
        trim: true,
    },
    goal: {
        type: Number,
        required: true, // Funding goal in ETH or other units
        min: 0,
    },
    currentAmount: {
        type: Number,
        default: 0, // Tracks the current contributions
        min: 0,
    },
    contributors: {
        type: [String], // Array of wallet addresses that contributed
        default: [],
    },
    imageUrl: {
        type: String, // URL to the campaign's image (local or cloud storage)
    },
    //metadataIPFSHash: {
    //    type: String, // Optional: IPFS hash for metadata if decentralized
    //    default: null,
    //},
    status: {
        type: String,
        enum: ["active", "completed", "failed"], // Current status of the campaign
        default: "active",
    },
    createdAt: {
        type: Date,
        default: Date.now, // Auto-set to the current date
    },
    deadline: {
        type: Date, // Deadline for funding the campaign
        required: true,
    },
}, {
    timestamps: true //createdAt, updatedAt
}
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
