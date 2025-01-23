import mongoose from 'mongoose'

const campaignSchema = new mongoose.Schema({
    campaignContract: {
        type: String,
        required: true, // Address of the campaign contract
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    
    imageURL: {
        type: String, // URL to the campaign's image (local or cloud storage)
    },
    //metadataIPFSHash: {
    //    type: String, // Optional: IPFS hash for metadata if decentralized
    //    default: null,
    //},
}, {
    timestamps: true //createdAt, updatedAt
}
);

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;
