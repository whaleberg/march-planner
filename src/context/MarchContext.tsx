import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { MarchData, MarchDay, Marcher, PartnerOrganization } from '../types';
import { sampleMarchData } from '../data/sampleData';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import { calculateDayDistance, calculateWalkingTime } from '../utils/routeUtils';

// Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
const USE_LOCAL_STORAGE = (import.meta as any).env?.VITE_USE_LOCAL_STORAGE === 'true' || !API_BASE_URL;
const AUTH_BASE_URL = (import.meta as any).env?.VITE_AUTH_API_URL || '';
const USE_LOCAL_AUTH = (import.meta as any).env?.VITE_USE_LOCAL_AUTH === 'true' || !AUTH_BASE_URL;

interface MarchContextType {
  marchData: MarchData;
  updateMarchData: (data: MarchData) => void;
  updateDay: (dayId: string, updatedDay: MarchDay) => void;
  updateMarcher: (marcherId: string, updatedMarcher: Marcher) => void;
  updatePartnerOrganization: (orgId: string, updatedOrg: PartnerOrganization) => void;
  addMarcher: (marcher: Marcher) => void;
  addPartnerOrganization: (org: PartnerOrganization) => void;
  addDay: (day: Omit<MarchDay, 'id'>, insertPosition?: number) => void;
  deleteMarcher: (marcherId: string) => void;
  deletePartnerOrganization: (orgId: string) => void;
  deleteDay: (dayId: string) => void;
  resetToSampleData: () => void;
  exportData: () => void;
  importData: (data: MarchData) => void;
  updateStartDate: (newStartDate: string) => void;
  getDayNumber: (dayId: string) => number;
  getTotalDistance: () => number;
  getDayDistance: (day: MarchDay) => number;
  getDayWalkingTime: (day: MarchDay) => number;
  isLoading: boolean;
  error: string | null;
  lastSaved: string | null;
  isUsingLocalStorage: boolean;
}

const MarchContext = createContext<MarchContextType | undefined>(undefined);

function useMarchData() {
  const context = useContext(MarchContext);
  if (context === undefined) {
    throw new Error('useMarchData must be used within a MarchProvider');
  }
  return context;
}

export { useMarchData };

interface MarchProviderProps {
  children: ReactNode;
}

// Helper function to update dates for all days based on start date
const updateDatesFromStartDate = (days: MarchDay[], startDate: string): MarchDay[] => {
  const start = new Date(startDate);
  return days.map((day, index) => {
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + index);
    return {
      ...day,
      date: dayDate.toISOString().split('T')[0]
    };
  });
};

export const MarchProvider: React.FC<MarchProviderProps> = ({ children }) => {
  const [marchData, setMarchData] = useState<MarchData>(sampleMarchData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await apiService.loadMarchData();
        setMarchData(data);
        setError(null);
      } catch (error) {
        console.warn('Failed to load data, using sample data:', error);
        setMarchData(sampleMarchData);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      }
      
      setIsLoading(false);
      setIsInitialLoad(false);
    };

    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    const saveData = async () => {
      // Skip saving during initial load
      if (isInitialLoad) {
        return;
      }
      
      try {
        // Skip saving if using local authentication (backend doesn't recognize local tokens)
        if (USE_LOCAL_AUTH) {
          return;
        }
        
        // Only attempt to save if user is authenticated
        const token = authService.getAuthToken();
        if (!token) {
          return;
        }
        
        await apiService.saveMarchData(marchData);
        setLastSaved(new Date().toISOString());
        setError(null);
      } catch (error) {
        console.error('Failed to save data:', error);
        setError(error instanceof Error ? error.message : 'Failed to save data. Please try again.');
      }
    };

    // Don't save on initial load
    if (!isLoading && !isInitialLoad) {
      saveData();
    }
  }, [marchData, isLoading, isInitialLoad]);

  // Calculate total distance dynamically from route points
  const getTotalDistance = (): number => {
    return marchData.days.reduce((total, day) => {
      const dayDistance = getDayDistance(day);
      return total + dayDistance;
    }, 0);
  };

  // Calculate distance for a specific day from route points
  const getDayDistance = (day: MarchDay): number => {
    return calculateDayDistance(day.route.routePoints);
  };

  // Calculate walking time for a specific day (assuming 3 mph walking pace)
  const getDayWalkingTime = (day: MarchDay): number => {
    const distance = getDayDistance(day);
    return calculateWalkingTime(distance);
  };

  // Get day number by position
  const getDayNumber = (dayId: string): number => {
    const index = marchData.days.findIndex(day => day.id === dayId);
    return index >= 0 ? index + 1 : 0;
  };

  const updateMarchData = (data: MarchData) => {
    setMarchData(data);
  };

  const updateDay = (dayId: string, updatedDay: MarchDay) => {
    setMarchData(prev => {
      const result = {
        ...prev,
        days: prev.days.map(day => {
          if (day.id === dayId) {
            // Deep copy the updated day to prevent sharing references
            return {
              ...updatedDay,
              route: {
                ...updatedDay.route,
                routePoints: updatedDay.route.routePoints ? 
                  updatedDay.route.routePoints.map(point => ({ ...point })) : []
              },
              specialEvents: updatedDay.specialEvents ? 
                updatedDay.specialEvents.map(event => ({ ...event })) : [],
              marchers: Array.isArray(updatedDay.marchers) ? [...updatedDay.marchers] : [],
              partnerOrganizations: Array.isArray(updatedDay.partnerOrganizations) ? [...updatedDay.partnerOrganizations] : []
            };
          }
          return day;
        })
      };
      return result;
    });
  };

  const updateMarcher = (marcherId: string, updatedMarcher: Marcher) => {
    setMarchData(prev => ({
      ...prev,
      marchers: prev.marchers.map(marcher => marcher.id === marcherId ? updatedMarcher : marcher)
    }));
  };

  const updatePartnerOrganization = (orgId: string, updatedOrg: PartnerOrganization) => {
    setMarchData(prev => ({
      ...prev,
      partnerOrganizations: prev.partnerOrganizations.map(org => org.id === orgId ? updatedOrg : org)
    }));
  };

  const addMarcher = (marcher: Marcher) => {
    setMarchData(prev => ({
      ...prev,
      marchers: [...prev.marchers, marcher]
    }));
  };

  const addPartnerOrganization = (org: PartnerOrganization) => {
    setMarchData(prev => ({
      ...prev,
      partnerOrganizations: [...prev.partnerOrganizations, org]
    }));
  };

  const addDay = (dayData: Omit<MarchDay, 'id'>, insertPosition?: number) => {
    setMarchData(prev => {
      const newDay: MarchDay = {
        ...dayData,
        id: `day-${Date.now()}`
      };
      
      // Determine where to insert the day
      const actualInsertPosition = insertPosition !== undefined ? insertPosition : prev.days.length;
      
      // Insert the day at the specified position
      const newDays = [...prev.days];
      newDays.splice(actualInsertPosition, 0, newDay);
      
      // If inserting at position 0 (before first day), update start date to new day's date
      const newStartDate = actualInsertPosition === 0 ? newDay.date : prev.startDate;
      
      // Update dates to be consecutive from start date
      const updatedDays = updateDatesFromStartDate(newDays, newStartDate);
      
      // Update route continuity
      const finalDays = updatedDays.map((day, index) => {
        if (index > 0) {
          // Update start point to match previous day's end point
          const prevDay = updatedDays[index - 1];
          return {
            ...day,
            route: {
              ...day.route,
              startPoint: prevDay.route.endPoint
            }
          };
        }
        return day;
      });
      
      return {
        ...prev,
        startDate: newStartDate,
        days: finalDays,
        endDate: finalDays.length > 0 ? finalDays[finalDays.length - 1].date : newStartDate
      };
    });
  };

  const deleteMarcher = (marcherId: string) => {
    setMarchData(prev => ({
      ...prev,
      marchers: prev.marchers.filter(marcher => marcher.id !== marcherId),
      days: prev.days.map(day => ({
        ...day,
        marchers: day.marchers.filter(id => id !== marcherId)
      }))
    }));
  };

  const deletePartnerOrganization = (orgId: string) => {
    setMarchData(prev => ({
      ...prev,
      partnerOrganizations: prev.partnerOrganizations.filter(org => org.id !== orgId),
      days: prev.days.map(day => ({
        ...day,
        partnerOrganizations: day.partnerOrganizations.filter(id => id !== orgId)
      }))
    }));
  };

  const deleteDay = (dayId: string) => {
    setMarchData(prev => {
      // Remove the day
      const newDays = prev.days.filter(day => day.id !== dayId);
      
      // Update dates to be consecutive from start date
      const updatedDays = updateDatesFromStartDate(newDays, prev.startDate);
      
      // Update route continuity
      const finalDays = updatedDays.map((day, index) => {
        if (index > 0) {
          // Update start point to match previous day's end point
          const prevDay = updatedDays[index - 1];
          return {
            ...day,
            route: {
              ...day.route,
              startPoint: prevDay.route.endPoint
            }
          };
        }
        return day;
      });
      
      return {
        ...prev,
        days: finalDays,
        endDate: finalDays.length > 0 ? finalDays[finalDays.length - 1].date : prev.startDate
      };
    });
  };

  const updateStartDate = (newStartDate: string) => {
    setMarchData(prev => {
      // Update all dates to be consecutive from the new start date
      const updatedDays = updateDatesFromStartDate(prev.days, newStartDate);
      
      return {
        ...prev,
        startDate: newStartDate,
        days: updatedDays,
        endDate: updatedDays.length > 0 ? updatedDays[updatedDays.length - 1].date : newStartDate
      };
    });
  };

  const resetToSampleData = async () => {
    if (window.confirm('Are you sure you want to reset all data to the sample data? This will delete all your current data.')) {
      try {
        await apiService.resetMarchData();
        setMarchData(sampleMarchData);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to reset data. Please try again.');
      }
    }
  };

  const exportData = async () => {
    try {
      const data = await apiService.exportMarchData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `march-organizer-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export data. Please try again.');
    }
  };

  const importData = async (data: MarchData) => {
    if (window.confirm('Are you sure you want to import this data? This will replace all your current data.')) {
      try {
        await apiService.importMarchData(data);
        setMarchData(data);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to import data. Please try again.');
      }
    }
  };

  const value: MarchContextType = {
    marchData,
    updateMarchData,
    updateDay,
    updateMarcher,
    updatePartnerOrganization,
    addMarcher,
    addPartnerOrganization,
    addDay,
    deleteMarcher,
    deletePartnerOrganization,
    deleteDay,
    resetToSampleData,
    exportData,
    importData,
    updateStartDate,
    getDayNumber,
    getTotalDistance,
    getDayDistance,
    getDayWalkingTime,
    isLoading,
    error,
    lastSaved,
    isUsingLocalStorage: USE_LOCAL_STORAGE
  };

  return (
    <MarchContext.Provider value={value}>
      {children}
    </MarchContext.Provider>
  );
}; 