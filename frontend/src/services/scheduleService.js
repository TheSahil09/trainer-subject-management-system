const BASE_URL = "http://localhost:8080/api";

export const scheduleService = {
  getAll: async () => {
    try {
      console.log("📥 Fetching all schedules from /api/schedule...");
      const response = await fetch(`${BASE_URL}/schedule`);
      if (!response.ok) {
        console.error("❌ Failed to fetch schedules. Status:", response.status);
        throw new Error(`Failed to fetch schedules: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("✅ Schedules loaded successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Error in getAll():", error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`📥 Fetching schedule ${id}...`);
      const response = await fetch(`${BASE_URL}/schedule/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch schedule: ${response.statusText}`);
      const data = await response.json();
      console.log("✅ Schedule loaded:", data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching schedule ${id}:`, error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log("📤 Creating new schedule...", data);
      const response = await fetch(`${BASE_URL}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to create schedule: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Schedule created:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating schedule:", error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log(`📤 Updating schedule ${id}...`, data);
      const response = await fetch(`${BASE_URL}/schedule/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to update schedule: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Schedule updated:", result);
      return result;
    } catch (error) {
      console.error(`❌ Error updating schedule ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting schedule ${id}...`);
      const response = await fetch(`${BASE_URL}/schedule/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Failed to delete schedule: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Schedule deleted");
      return result;
    } catch (error) {
      console.error(`❌ Error deleting schedule ${id}:`, error.message);
      throw error;
    }
  },

  getStudentTimetable: async (courseId) => {
    try {
      console.log(`📥 Fetching timetable for course ${courseId}...`);
      const response = await fetch(`${BASE_URL}/schedule/course/${courseId}`);
      if (!response.ok) throw new Error(`Failed to fetch course timetable: ${response.statusText}`);
      const data = await response.json();
      console.log("✅ Student timetable loaded:", data);
      return data;
  }
}

}