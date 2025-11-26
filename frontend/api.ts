import {
  AccessRequest,
  MedicalRecord,
  User,
  UserRole,
  SystemEvent,
} from "./types";

// Backend API URL
const API_URL = "http://localhost:5000/api";

// Helper to get auth token
const getAuthToken = () => localStorage.getItem("token");

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Request failed");
    return data;
  } catch (error: any) {
    console.error("API Call Error:", error);
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to server. Please ensure backend is running on http://localhost:5000",
      );
    }
    throw error;
  }
};

// Helper for file upload
const uploadFile = async (endpoint: string, formData: FormData) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Upload failed" }));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    if (!data.success) throw new Error(data.message || "Upload failed");
    return data;
  } catch (error: any) {
    console.error("Upload Error:", error);
    if (error.message === "Failed to fetch") {
      throw new Error(
        "Cannot connect to server. Please ensure backend is running on http://localhost:5000",
      );
    }
    throw error;
  }
};

export const api = {
  auth: {
    login: async (
      email: string,
      password: string,
      role: UserRole,
    ): Promise<User> => {
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
      });

      // Store token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      return response.user;
    },

    signup: async (data: any): Promise<User> => {
      // Ensure role is included
      const signupData = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role || UserRole.PATIENT,
        ...(data.role === UserRole.PATIENT && {
          age: data.age,
          gender: data.gender,
        }),
        ...(data.role === UserRole.DOCTOR && {
          licenseId: data.licenseId,
          specialization: data.specialization,
        }),
      };

      const response = await apiCall("/auth/signup", {
        method: "POST",
        body: JSON.stringify(signupData),
      });

      // Store token
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      return response.user;
    },

    logout: async (): Promise<void> => {
      await apiCall("/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
    },

    getMe: async (): Promise<User> => {
      const response = await apiCall("/auth/me");
      return response.user;
    },
  },

  records: {
    upload: async (
      formData: FormData,
    ): Promise<{ cid: string; txHash: string; lamport: number }> => {
      const response = await uploadFile("/records/upload", formData);
      return response.data.blockchain;
    },

    getAll: async (): Promise<MedicalRecord[]> => {
      const response = await apiCall("/records");
      return response.data;
    },

    getById: async (id: string): Promise<MedicalRecord> => {
      const response = await apiCall(`/records/${id}`);
      return response.data;
    },

    delete: async (id: string): Promise<void> => {
      await apiCall(`/records/${id}`, { method: "DELETE" });
    },

    getDoctorAccessible: async (): Promise<any[]> => {
      const response = await apiCall("/records/doctor/accessible");
      return response.data;
    },

    downloadUrl: (filename: string): string => {
      const token = getAuthToken();
      return `${API_URL}/records/download/${filename}?token=${token}`;
    },
  },

  access: {
    request: async (data: {
      patientId: string;
      purpose: string;
      requestedDuration?: number;
    }): Promise<void> => {
      await apiCall("/access/request", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    getRequests: async (): Promise<AccessRequest[]> => {
      const response = await apiCall("/access/requests");
      return response.data;
    },

    approve: async (
      id: string,
      duration?: number,
      responseMessage?: string,
    ): Promise<void> => {
      await apiCall(`/access/approve/${id}`, {
        method: "PUT",
        body: JSON.stringify({ duration, responseMessage }),
      });
    },

    reject: async (id: string, responseMessage?: string): Promise<void> => {
      await apiCall(`/access/reject/${id}`, {
        method: "PUT",
        body: JSON.stringify({ responseMessage }),
      });
    },

    getGrantedRecords: async (): Promise<any[]> => {
      const response = await apiCall("/access/granted");
      return response.data;
    },

    getPatientGrantedAccesses: async (): Promise<any[]> => {
      const response = await apiCall("/access/granted/patient");
      return response.data;
    },

    revoke: async (id: string, reason?: string): Promise<void> => {
      await apiCall(`/access/revoke/${id}`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
    },
  },

  events: {
    getAll: async (filters?: any): Promise<SystemEvent[]> => {
      const params = new URLSearchParams(filters).toString();
      const response = await apiCall(`/events${params ? "?" + params : ""}`);
      return response.data;
    },

    getDashboard: async (): Promise<SystemEvent[]> => {
      const response = await apiCall("/events/dashboard");
      return response.data;
    },
  },
};
