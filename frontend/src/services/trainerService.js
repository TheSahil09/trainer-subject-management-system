const BASE_URL = "http://localhost:8080/api";

export const trainerService = {
  getAll: async () => {
    try {
      console.log("📥 Fetching all trainers from /api/trainer...");
      const response = await fetch(`${BASE_URL}/trainer`);
      if (!response.ok) {
        console.error("❌ Failed to fetch trainers. Status:", response.status);
        throw new Error(`Failed to fetch trainers: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("✅ Trainers loaded successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Error in getAll():", error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`📥 Fetching trainer ${id}...`);
      const response = await fetch(`${BASE_URL}/trainer/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch trainer: ${response.statusText}`);
      const data = await response.json();
      console.log("✅ Trainer loaded:", data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching trainer ${id}:`, error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log("📤 Creating new trainer...", data);
      const response = await fetch(`${BASE_URL}/trainer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to create trainer: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Trainer created:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating trainer:", error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log(`📤 Updating trainer ${id}...`, data);
      const response = await fetch(`${BASE_URL}/trainer/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to update trainer: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Trainer updated:", result);
      return result;
    } catch (error) {
      console.error(`❌ Error updating trainer ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting trainer ${id}...`);
      const response = await fetch(`${BASE_URL}/trainer/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Failed to delete trainer: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Trainer deleted");
      return result;
    } catch (error) {
      console.error(`❌ Error deleting trainer ${id}:`, error.message);
      throw error;
    }
  },
};
