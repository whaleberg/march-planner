import { MarchData } from '../types';
import authService from './authService';

// Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
const USE_LOCAL_STORAGE = (import.meta as any).env?.VITE_USE_LOCAL_STORAGE === 'true' || !API_BASE_URL;

console.log('ApiService config:', {
  API_BASE_URL,
  USE_LOCAL_STORAGE,
  VITE_API_URL: (import.meta as any).env?.VITE_API_URL,
  VITE_USE_LOCAL_STORAGE: (import.meta as any).env?.VITE_USE_LOCAL_STORAGE
});

// Local storage key
const STORAGE_KEY = 'march_data';

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = authService.getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Unauthorized - clear auth and redirect to login
    await authService.logout();
    window.location.href = '/login';
    throw new Error('Authentication required');
  }
  
  if (response.status === 403) {
    throw new Error('Insufficient permissions');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

class ApiService {
  // Load march data
  async loadMarchData(): Promise<MarchData> {
    if (USE_LOCAL_STORAGE) {
      return this.loadFromLocalStorage();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/march-data`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Failed to load march data:', error);
      throw error;
    }
  }

  // Save march data
  async saveMarchData(data: MarchData): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return this.saveToLocalStorage(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/march-data`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      await handleResponse(response);
    } catch (error) {
      console.error('Failed to save march data:', error);
      throw error;
    }
  }

  // Export march data
  async exportMarchData(): Promise<MarchData> {
    if (USE_LOCAL_STORAGE) {
      return this.loadFromLocalStorage();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/march-data/export`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to export march data:', error);
      throw error;
    }
  }

  // Import march data
  async importMarchData(data: MarchData): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return this.saveToLocalStorage(data);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/march-data/import`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });

      await handleResponse(response);
    } catch (error) {
      console.error('Failed to import march data:', error);
      throw error;
    }
  }

  // Reset march data
  async resetMarchData(): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      return this.resetLocalStorage();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/march-data/reset`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      await handleResponse(response);
    } catch (error) {
      console.error('Failed to reset march data:', error);
      throw error;
    }
  }

  // Local storage methods (fallback)
  private loadFromLocalStorage(): MarchData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that the stored data has the required structure
        if (parsed && typeof parsed === 'object' && 
            Array.isArray(parsed.days) && 
            Array.isArray(parsed.marchers) && 
            Array.isArray(parsed.partnerOrganizations)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    
    // Return sample data if nothing is stored or invalid
    return {
      title: "Community Unity March",
      description: "A 3-day march to promote community solidarity and social justice awareness.",
      startDate: "2024-06-15",
      endDate: "2024-06-17",
      mapSettings: {
        googleMapsApiKey: (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '',
        defaultZoom: 10,
        mapCenter: { lat: 42.3601, lng: -71.0589 }
      },
      days: [],
      marchers: [],
      partnerOrganizations: []
    };
  }

  private saveToLocalStorage(data: MarchData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw error;
    }
  }

  private resetLocalStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset localStorage:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService; 