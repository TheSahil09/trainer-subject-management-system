const BASE_URL = "http://localhost:8080/api"; // base for all endpoints

export const enrollmentService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/enrollments`);
    if (!response.ok) throw new Error("Failed to fetch enrollments");
    return response.json();
  },

  getByStudent: async (studentId) => {
    const response = await fetch(
      `${BASE_URL}/enrollments/student/${studentId}`
    );
    if (!response.ok) throw new Error("Failed to fetch student enrollments");
    return response.json();
  },

  getBycurso: async (courseId) => {
    const response = await fetch(`${BASE_URL}/enrollments/course/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch course enrollments");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${BASE_URL}/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create enrollment");
    return response.json();
  },

  // Bulk operations
  bulkEnroll: async (studentIds, courseId) => {
    const response = await fetch(`${BASE_URL}/enrollments/bulk-enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentIds,
        courseId,
      }),
    });

    if (!response.ok) throw new Error("Failed to bulk enroll");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/enrollments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete enrollment");
    return response.json();
  },
};

// Student Service
export const studentService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/student`);
    if (!response.ok) throw new Error("Failed to fetch students");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/student/${id}`);
    if (!response.ok) throw new Error("Failed to fetch student");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${BASE_URL}/student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create student");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/student/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to update student");
    return response.json();
  },

  // Bulk upload
  bulkUpload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/student/bulk-upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to bulk upload students");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/student/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete student");
    return response.json();
  },
};

// Module Service
export const moduleService = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/module`);
    if (!response.ok) throw new Error("Failed to fetch modules");
    return response.json();
  },

  getByCourse: async (courseId) => {
    const response = await fetch(`${BASE_URL}/module/course/${courseId}`);
    if (!response.ok) throw new Error("Failed to fetch course modules");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${BASE_URL}/module/${id}`);
    if (!response.ok) throw new Error("Failed to fetch module");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${BASE_URL}/module`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to create module");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${BASE_URL}/module/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to update module");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${BASE_URL}/module/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete module");
    return response.json();
  },
};
