import {create} from "zustand";

export const useCampaignStore = create((set) => ({
    campaigns: [],
    setCampaigns: (campaigns) => set({campaigns}),
    createCampaign: async (newCampaign) => {
        if(!newCampaign.campaignContract || !newCampaign.description || !newCampaign.image) {
            return {success:false, message: "Please fill out all fields"};
        }
        const res = await fetch("/api/campaigns", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newCampaign),
        });
        const data = await res.json();
        set((state) => ({campaigns: [...state.campaigns, data.data]}));
        return { success: true, message: "Campaign created" };
    }
}));