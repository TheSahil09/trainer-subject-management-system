const BASE_URL = "http://localhost:8080/api";

export const courseService = {
  getAll: async () => {
    try {
      console.log("📥 Fetching courses from /api/courses...");
      const response = await fetch(`${BASE_URL}/courses`);
      
      if (!response.ok) {
        console.error("❌ Failed to fetch courses. Status:", response.status);
        throw new Error(`Failed to fetch courses: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Courses loaded successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Error in getAll():", error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log(`📥 Fetching course ${id}...`);
      const response = await fetch(`${BASE_URL}/courses/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch course: ${response.statusText}`);
      const data = await response.json();
      console.log("✅ Course loaded:", data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching course ${id}:`, error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      console.log("📤 Creating new course...", data);
      const response = await fetch(`${BASE_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to create course: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Course created:", result);
      return result;
    } catch (error) {
      console.error("❌ Error creating course:", error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      console.log(`📤 Updating course ${id}...`, data);
      const response = await fetch(`${BASE_URL}/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`Failed to update course: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Course updated:", result);
      return result;
    } catch (error) {
      console.error(`❌ Error updating course ${id}:`, error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      console.log(`🗑️ Deleting course ${id}...`);
      const response = await fetch(`${BASE_URL}/courses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Failed to delete course: ${response.statusText}`);
      const result = await response.json();
      console.log("✅ Course deleted");
      return result;
    } catch (error) {
      console.error(`❌ Error deleting course ${id}:`, error.message);
      throw error;
    }
  },
};
