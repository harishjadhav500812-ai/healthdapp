import {
  AccessRequest,
  MedicalRecord,
  User,
  UserRole,
  SystemEvent,
} from "./types";

// Backend API URL
const API_URL = "http://localhost:5000/api";

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

// Helper function to remove auth token
const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

// Helper function to make authenticated requests
const authFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear token
  if (response.status === 401) {
    removeAuthToken();
  }

  return response;
};

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();

        // Store token
        if (data.token) {
          setAuthToken(data.token);
        }

        // Return user data
        return {
          id: data.user._id,
          name: data.user.name,
          role: data.user.role as UserRole,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
        };
      } catch (error: any) {
        console.error("Login error:", error);
        // If error already has a message (from backend), use it
        // Otherwise, it's a network error
        if (error.message && error.message !== "Failed to fetch") {
          throw error;
        }
        throw new Error(
          "Cannot connect to server. Please ensure backend is running on http://localhost:5000",
        );
      }
    },

    signup: async (data: any): Promise<User> => {
      try {
        const signupData: any = {
          name: data.fullName || data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        };

        // Add role-specific fields
        if (data.role === "PATIENT") {
          signupData.age = data.age;
          signupData.bloodType = data.bloodType;
          signupData.allergies = data.allergies;
        } else if (data.role === "DOCTOR") {
          signupData.licenseId = data.licenseId;
          signupData.specialization = data.specialization;
          signupData.hospitalAffiliation = data.hospitalAffiliation;
        }

        const response = await fetch(`${API_URL}/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signupData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Signup failed");
        }

        const result = await response.json();

        // Store token
        if (result.token) {
          setAuthToken(result.token);
        }

        // Return user data
        return {
          id: result.user._id,
          name: result.user.name,
          role: result.user.role as UserRole,
          email: result.user.email,
          avatarUrl: result.user.avatarUrl,
        };
      } catch (error: any) {
        console.error("Signup error:", error);
        // If error already has a message (from backend), use it
        // Otherwise, it's a network error
        if (error.message && error.message !== "Failed to fetch") {
          throw error;
        }
        throw new Error(
          "Cannot connect to server. Please ensure backend is running on http://localhost:5000",
        );
      }
    },

    logout: (): void => {
      removeAuthToken();
    },

    getCurrentUser: async (): Promise<User | null> => {
      try {
        const response = await authFetch(`${API_URL}/auth/me`);

        if (!response.ok) {
          return null;
        }

        const data = await response.json();

        return {
          id: data.user._id,
          name: data.user.name,
          role: data.user.role as UserRole,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
        };
      } catch (error) {
        console.error("Get current user error:", error);
        return null;
      }
    },
  },

  records: {
    upload: async (
      formData: FormData,
    ): Promise<{ cid: string; txHash: string; lamport: number }> => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/records/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }

        const data = await response.json();

        return {
          cid: data.record.ipfsCid,
          txHash: data.record.transactionHash,
          lamport: data.record.blockNumber || 0,
        };
      } catch (error: any) {
        console.error("Upload error:", error);
        throw new Error(error.message || "Failed to upload record");
      }
    },

    getAll: async (): Promise<MedicalRecord[]> => {
      try {
        const response = await authFetch(`${API_URL}/records`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch records");
        }

        const data = await response.json();

        // Transform backend data to frontend format
        return data.records.map((record: any) => ({
          id: record._id,
          fileName: record.fileName,
          uploadDate: new Date(record.uploadDate).toISOString().split("T")[0],
          fileSize: record.fileSize,
          ipfsCid: record.ipfsCid,
          txHash: record.transactionHash,
          recordType: record.recordType,
          description: record.description,
        }));
      } catch (error: any) {
        console.error("Get records error:", error);
        throw new Error(error.message || "Failed to fetch records");
      }
    },

    delete: async (id: string): Promise<void> => {
      try {
        const response = await authFetch(`${API_URL}/records/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to delete record");
        }
      } catch (error: any) {
        console.error("Delete record error:", error);
        throw new Error(error.message || "Failed to delete record");
      }
    },
  },

  access: {
    request: async (data: {
      patientId: string;
      purpose: string;
    }): Promise<void> => {
      try {
        const response = await authFetch(`${API_URL}/access/request`, {
          method: "POST",
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to send access request");
        }
      } catch (error: any) {
        console.error("Request access error:", error);
        throw new Error(error.message || "Failed to send access request");
      }
    },

    getRequests: async (): Promise<AccessRequest[]> => {
      try {
        const response = await authFetch(`${API_URL}/access/requests`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch requests");
        }

        const data = await response.json();

        // Transform backend data to frontend format
        return data.requests.map((req: any) => ({
          id: req._id,
          patientId: req.patientId._id,
          patientName: req.patientId.name,
          doctorId: req.doctorId._id,
          doctorName: req.doctorId.name,
          specialization: req.doctorId.specialization || "N/A",
          purpose: req.purpose,
          status: req.status,
          timestamp: new Date(req.createdAt).toLocaleString(),
          riskLevel: req.riskLevel || "LOW",
        }));
      } catch (error: any) {
        console.error("Get requests error:", error);
        throw new Error(error.message || "Failed to fetch requests");
      }
    },

    approve: async (id: string, duration?: number): Promise<void> => {
      try {
        const response = await authFetch(`${API_URL}/access/approve/${id}`, {
          method: "PUT",
          body: JSON.stringify({ duration: duration || 24 }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to approve request");
        }
      } catch (error: any) {
        console.error("Approve request error:", error);
        throw new Error(error.message || "Failed to approve request");
      }
    },

    reject: async (id: string): Promise<void> => {
      try {
        const response = await authFetch(`${API_URL}/access/reject/${id}`, {
          method: "PUT",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to reject request");
        }
      } catch (error: any) {
        console.error("Reject request error:", error);
        throw new Error(error.message || "Failed to reject request");
      }
    },

    getGrantedRecords: async (): Promise<any[]> => {
      try {
        const response = await authFetch(`${API_URL}/access/granted`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch granted access");
        }

        const data = await response.json();

        // Transform backend data to frontend format
        return data.grantedAccess.map((access: any) => ({
          id: access._id,
          patient: access.patientId.name,
          patientId: access.patientId._id,
          record: access.recordId?.fileName || "All Records",
          recordId: access.recordId?._id,
          expiry: access.expiresAt
            ? `${Math.ceil((new Date(access.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))}h`
            : "N/A",
          cid: access.recordId?.ipfsCid || "N/A",
          grantedAt: new Date(access.grantedAt).toLocaleString(),
        }));
      } catch (error: any) {
        console.error("Get granted records error:", error);
        throw new Error(error.message || "Failed to fetch granted access");
      }
    },
  },

  events: {
    getAll: async (): Promise<SystemEvent[]> => {
      try {
        const response = await authFetch(`${API_URL}/events`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch events");
        }

        const data = await response.json();

        return data.events.map((event: any) => ({
          id: event._id,
          type: event.eventType,
          description: event.description,
          timestamp: new Date(event.timestamp).toLocaleString(),
          userId: event.userId?._id,
          userName: event.userId?.name,
          metadata: event.metadata,
        }));
      } catch (error: any) {
        console.error("Get events error:", error);
        throw new Error(error.message || "Failed to fetch events");
      }
    },
  },
};

// Export auth helpers
export { getAuthToken, setAuthToken, removeAuthToken };
