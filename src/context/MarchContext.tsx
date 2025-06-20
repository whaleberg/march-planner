import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { MarchData, MarchDay, Marcher, PartnerOrganization } from '../types';
import { sampleMarchData } from '../data/sampleData';

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
}

const MarchContext = createContext<MarchContextType | undefined>(undefined);

export const useMarchData = () => {
  const context = useContext(MarchContext);
  if (context === undefined) {
    throw new Error('useMarchData must be used within a MarchProvider');
  }
  return context;
};

interface MarchProviderProps {
  children: ReactNode;
}

// Local storage key
const STORAGE_KEY = 'march-organizer-data';

// Helper function to load data from localStorage
const loadDataFromStorage = (): MarchData => {
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
    console.warn('Failed to load data from localStorage:', error);
  }
  return sampleMarchData;
};

// Helper function to save data to localStorage
const saveDataToStorage = (data: MarchData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

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
  const [marchData, setMarchData] = useState<MarchData>(() => loadDataFromStorage());

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveDataToStorage(marchData);
  }, [marchData]);

  // Calculate total distance dynamically
  const getTotalDistance = (): number => {
    return marchData.days.reduce((total, day) => total + day.route.distance, 0);
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
    setMarchData(prev => ({
      ...prev,
      days: prev.days.map(day => day.id === dayId ? updatedDay : day)
    }));
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

  const resetToSampleData = () => {
    if (window.confirm('Are you sure you want to reset all data to the sample data? This will delete all your current data.')) {
      setMarchData(sampleMarchData);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(marchData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `march-organizer-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (data: MarchData) => {
    if (window.confirm('Are you sure you want to import this data? This will replace all your current data.')) {
      setMarchData(data);
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
    getTotalDistance
  };

  return (
    <MarchContext.Provider value={value}>
      {children}
    </MarchContext.Provider>
  );
}; 