import { MarchData } from '../types';

export const sampleMarchData: MarchData = {
  title: "Community Unity March",
  description: "A 3-day march to promote community solidarity and social justice awareness.",
  startDate: "2024-06-15",
  endDate: "2024-06-17",
  mapSettings: {
    googleMapsApiKey: (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '',
    defaultZoom: 10,
    mapCenter: { lat: 39.8283, lng: -98.5795 }
  },
  days: [
    {
      id: "day-1",
      date: "2024-06-15",
      route: {
        startPoint: "City Hall",
        endPoint: "Community Park",
        distance: 5,
        estimatedDuration: 2,
        terrain: "Urban sidewalks and park paths",
        notes: "Opening day with community gathering",
        routePoints: [],
        polylinePath: ""
      },
      breakfast: {
        time: "7:00 AM",
        location: "City Hall Plaza",
        description: "Continental breakfast with coffee and pastries",
        providedBy: "Local Community Center"
      },
      lunch: {
        time: "12:00 PM",
        location: "Community Park",
        description: "Sandwiches and refreshments",
        providedBy: "Local Food Bank"
      },
      dinner: {
        time: "6:00 PM",
        location: "Community Center",
        description: "Community potluck dinner",
        providedBy: "Local Churches"
      },
      specialEvents: [
        {
          id: "event-1-1",
          title: "Opening Ceremony",
          time: "8:00 AM",
          location: "City Hall Plaza",
          description: "Opening ceremony with community leaders",
          organizer: "March Organizing Committee"
        }
      ],
      marchers: ["marcher-1", "marcher-2"],
      partnerOrganizations: ["org-1"]
    },
    {
      id: "day-2",
      date: "2024-06-16",
      route: {
        startPoint: "Community Park",
        endPoint: "University Campus",
        distance: 4,
        estimatedDuration: 1.5,
        terrain: "Residential streets and campus paths",
        notes: "Passing through university district",
        routePoints: [],
        polylinePath: ""
      },
      breakfast: {
        time: "7:00 AM",
        location: "Community Center",
        description: "Hot breakfast with eggs and toast",
        providedBy: "Community Center"
      },
      lunch: {
        time: "12:00 PM",
        location: "University Student Center",
        description: "Lunch at university dining hall",
        providedBy: "University Student Union"
      },
      dinner: {
        time: "6:00 PM",
        location: "University Campus",
        description: "International cuisine night",
        providedBy: "University International Students"
      },
      specialEvents: [
        {
          id: "event-2-1",
          title: "Student Rally",
          time: "7:00 PM",
          location: "University Campus",
          description: "Evening rally with university students",
          organizer: "University Student Activists"
        }
      ],
      marchers: ["marcher-1", "marcher-3"],
      partnerOrganizations: ["org-2"]
    },
    {
      id: "day-3",
      date: "2024-06-17",
      route: {
        startPoint: "University Campus",
        endPoint: "Memorial Plaza",
        distance: 3,
        estimatedDuration: 1,
        terrain: "Campus paths and downtown streets",
        notes: "Final day - closing ceremony",
        routePoints: [],
        polylinePath: ""
      },
      breakfast: {
        time: "7:00 AM",
        location: "University Campus",
        description: "Final march breakfast",
        providedBy: "University Dining Services"
      },
      lunch: {
        time: "12:00 PM",
        location: "Memorial Plaza",
        description: "Lunch at the plaza",
        providedBy: "Local Restaurants"
      },
      dinner: {
        time: "6:00 PM",
        location: "Memorial Plaza",
        description: "Victory dinner and celebration",
        providedBy: "March Organizing Committee"
      },
      specialEvents: [
        {
          id: "event-3-1",
          title: "Closing Ceremony",
          time: "7:00 PM",
          location: "Memorial Plaza",
          description: "Final rally and closing ceremony",
          organizer: "March Organizing Committee"
        }
      ],
      marchers: ["marcher-1", "marcher-2", "marcher-3"],
      partnerOrganizations: ["org-1", "org-2"]
    }
  ],
  marchers: [
    {
      id: "marcher-1",
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      phone: "555-0101",
      emergencyContact: "Emergency Contact (555-0102)",
      dietaryRestrictions: "None",
      notes: "Team leader"
    },
    {
      id: "marcher-2",
      name: "Sam Chen",
      email: "sam.chen@example.com",
      phone: "555-0103",
      emergencyContact: "Emergency Contact (555-0104)",
      dietaryRestrictions: "Vegetarian",
      notes: "First-time marcher"
    },
    {
      id: "marcher-3",
      name: "Jordan Rodriguez",
      email: "jordan.rodriguez@example.com",
      phone: "555-0105",
      emergencyContact: "Emergency Contact (555-0106)",
      dietaryRestrictions: "None",
      notes: "Student organizer"
    }
  ],
  partnerOrganizations: [
    {
      id: "org-1",
      name: "Community Unity Coalition",
      description: "Local coalition working on community solidarity and social justice",
      website: "https://example.com/community-unity",
      contactPerson: "Contact Person",
      contactEmail: "contact@example.com",
      contactPhone: "555-1234"
    },
    {
      id: "org-2",
      name: "University Social Justice Club",
      description: "Student organization promoting social justice awareness",
      website: "https://example.com/university-sjc",
      contactPerson: "Student Contact",
      contactEmail: "student@example.com",
      contactPhone: "555-5678"
    }
  ]
}; 