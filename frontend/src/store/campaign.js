import {create} from "zustand";
import { API_URL } from "../config";

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
    },

    // Fetch all campaigns
    fetchCampaigns: async () => {
        const res = await fetch(`${API_URL}/api/campaigns`); // Use API_URL
        const data = await res.json();
        // Update the state with the fetched campaigns
        set({ campaigns: data.data });
  },

    deleteCampaign: async (campaignId) => {
        const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
            method: 'DELETE',
        });

        const data = await res.json();
        if(!data.success) {
            return {success: false, message: data.message};
        }
        // Remove the deleted campaign from the state 
        // update ui immediately so we dont need to refresh the page
        set((state) => ({
            campaigns: state.campaigns.filter((campaign) => campaign._id !== campaignId)
        }));
        return { success: true, message: data.message };
  },

  updateCampaign: async (campaignId, updatedCampaign) => {
    const res = await fetch(`${API_URL}/api/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedCampaign),
    });

    const data = await res.json();
    if (!data.success) {
      return { success: false, message: data.message };
    }

    // Update the state with the updated campaign
    set((state) => ({
      campaigns: state.campaigns.map((campaign) => {
        if (campaign._id === campaignId) {
          return data.data;
        }
        return campaign;
      }),
    }));
    return { success: true, message: data.message };
  },
}));