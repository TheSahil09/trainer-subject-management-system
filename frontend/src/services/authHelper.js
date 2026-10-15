// authHelper.js - Simple centralized auth header handling

const BASE_URL = "http://localhost:8080/api";

// Get token from localStorage
function getToken() {
  return localStorage.getItem("token");
}

// Make API call with auth header automatically
export async function apiCall(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  // Add auth header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Log request
    console.log(`${options.method || "GET"} ${endpoint} - Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return { ok: true, data, status: response.status };
    
  } catch (error) {
    console.error(`Request failed: ${endpoint}`, error);
    return { ok: false, error: error.message };
  }
}

// Specific API methods for convenience

export async function fetchAll(resource) {
  return apiCall(`/${resource}`);
}

export async function fetchByRole(resource, role) {
  return apiCall(`/${resource}?role=${role}`);
}

export async function fetchById(resource, id) {
  return apiCall(`/${resource}/${id}`);
}

export async function createResource(resource, data) {
  return apiCall(`/${resource}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateResource(resource, id, data) {
  return apiCall(`/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteResource(resource, id) {
  return apiCall(`/${resource}/${id}`, {
    method: "DELETE",
  });
}
