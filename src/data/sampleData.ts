import { MarchData } from '../types';

export const sampleMarchData: MarchData = {
  title: "Massachusetts Unity March",
  description: "A 3-day march across eastern Massachusetts to promote community solidarity and social justice awareness.",
  startDate: "2024-06-15",
  endDate: "2024-06-17",
  missionStatement: {
    title: "More than a march—a people's movement",
    subtitle: "Join us as we walk together, strengthening community bonds and demonstrating our commitment to democracy.",
    description: "Every step counts, every voice matters. This march represents our collective commitment to building stronger, more inclusive communities across Massachusetts."
  },
  callToAction: {
    title: "Join the Movement",
    description: "Whether you can walk for an hour, a day, or the entire journey, your participation makes a difference. Together, we can create lasting change."
  },
  itineraryDescription: "Join us for an hour, a day, a week, or the whole way. Each day offers unique opportunities to connect with communities and make your voice heard.",
  mapSettings: {
    googleMapsApiKey: (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '',
    defaultZoom: 10,
    mapCenter: { lat: 42.3601, lng: -71.0589 } // Boston
  },
  days: [
    {
      id: "day-1",
      date: "2024-06-15",
      route: {
        startPoint: "Boston Common",
        endPoint: "Newton City Hall",
        terrain: "Urban streets and suburban paths",
        notes: "Starting from Boston Common through Brookline to Newton",
        routePoints: [
          {
            id: "day1-start",
            name: "Boston Common",
            address: "139 Tremont St, Boston, MA 02111",
            coordinates: { lat: 42.3554, lng: -71.0655 },
            type: "start",
            description: "Starting from Boston Common"
          },
          {
            id: "day1-waypoint1",
            name: "Brookline Village",
            address: "Brookline Village, Brookline, MA 02445",
            coordinates: { lat: 42.3318, lng: -71.1212 },
            type: "waypoint",
            description: "Rest stop at Brookline Village"
          },
          {
            id: "day1-waypoint2",
            name: "Newton Centre",
            address: "Newton Centre, Newton, MA 02459",
            coordinates: { lat: 42.3370, lng: -71.2094 },
            type: "waypoint",
            description: "Rest stop at Newton Centre"
          },
          {
            id: "day1-end",
            name: "Newton City Hall",
            address: "1000 Commonwealth Ave, Newton, MA 02459",
            coordinates: { lat: 42.3370, lng: -71.2094 },
            type: "end",
            description: "End of day 1 at Newton City Hall"
          }
        ],
        polylinePath: ""
      },
      breakfast: {
        time: "7:00 AM",
        location: "Boston Common",
        description: "Opening breakfast provided by local community groups",
        providedBy: "Boston Community Organizations",
        notes: ""
      },
      lunch: {
        time: "12:00 PM",
        location: "Brookline Village",
        description: "Lunch at Brookline Village",
        providedBy: "Brookline Community Groups",
        notes: ""
      },
      dinner: {
        time: "6:00 PM",
        location: "Newton Community Center",
        description: "Community potluck dinner",
        providedBy: "Newton Community Groups",
        notes: ""
      },
      specialEvents: [
        {
          id: "event-1-1",
          title: "Opening Ceremony",
          time: "8:00 AM",
          location: "Boston Common",
          description: "Opening ceremony with community leaders and elected officials",
          organizer: "March Organizing Committee"
        }
      ],
      marchers: ["marcher-1", "marcher-2"],
      partnerOrganizations: ["org-1"],
      vehicleSchedules: [
        {
          vehicleId: "vehicle-1",
          driver: "marcher-1",
          driverContact: "617-555-0101",
          notes: "Support vehicle for supplies and equipment"
        }
      ],
      dailyOrganizer: {
        name: "Jennifer Martinez",
        email: "jennifer.martinez@march.org",
        phone: "(617) 555-0101"
      },
      marchLeaderId: "marcher-1"
    },
    {
      id: "day-2",
      date: "2024-06-16",
      route: {
        startPoint: "Newton City Hall",
        endPoint: "Framingham State University",
        terrain: "Residential streets and suburban paths",
        notes: "Passing through Wellesley and Natick",
        routePoints: [
          {
            id: "day2-start",
            name: "Newton City Hall",
            address: "1000 Commonwealth Ave, Newton, MA 02459",
            coordinates: { lat: 42.3370, lng: -71.2094 },
            type: "start",
            description: "Starting from Newton City Hall"
          },
          {
            id: "day2-waypoint1",
            name: "Wellesley College",
            address: "106 Central St, Wellesley, MA 02481",
            coordinates: { lat: 42.2955, lng: -71.3074 },
            type: "waypoint",
            description: "Rest stop at Wellesley College campus"
          },
          {
            id: "day2-waypoint2",
            name: "Natick Center",
            address: "Natick Center, Natick, MA 01760",
            coordinates: { lat: 42.2834, lng: -71.3495 },
            type: "waypoint",
            description: "Lunch stop in Natick Center"
          },
          {
            id: "day2-end",
            name: "Framingham State University",
            address: "100 State St, Framingham, MA 01702",
            coordinates: { lat: 42.2794, lng: -71.4163 },
            type: "end",
            description: "End of day 2 at Framingham State University"
          }
        ],
        polylinePath: ""
      },
      breakfast: {
        time: "7:00 AM",
        location: "Newton Community Center",
        description: "Hot breakfast with eggs and toast",
        providedBy: "Newton Community Center"
      },
      lunch: {
        time: "12:00 PM",
        location: "Natick Center",
        description: "Lunch at local restaurants",
        providedBy: "Natick Chamber of Commerce"
      },
      dinner: {
        time: "6:00 PM",
        location: "Framingham State University",
        description: "Dinner at university dining hall",
        providedBy: "Framingham State University"
      },
      specialEvents: [
        {
          id: "event-2-1",
          title: "Wellesley College Rally",
          time: "3:00 PM",
          location: "Wellesley College Campus",
          description: "Afternoon rally with college students and faculty",
          organizer: "Wellesley College Student Activists"
        }
      ],
      marchers: ["marcher-1", "marcher-3"],
      partnerOrganizations: ["org-2"],
      vehicleSchedules: [
        {
          vehicleId: "vehicle-1",
          driver: "marcher-3",
          driverContact: "617-555-0105",
          notes: "Support vehicle for supplies and equipment"
        },
        {
          vehicleId: "vehicle-2",
          driver: "marcher-1",
          driverContact: "617-555-0101",
          notes: "Medical support vehicle"
        }
      ],
      dailyOrganizer: {
        name: "Michael Thompson",
        email: "michael.thompson@march.org",
        phone: "(617) 555-0102"
      },
      marchLeaderId: "marcher-1"
    },
    {
      id: "day-3",
      date: "2024-06-17",
      route: {
        startPoint: "Framingham State University",
        endPoint: "Worcester City Hall",
        terrain: "Suburban and urban streets",
        notes: "Final day through Marlborough and into Worcester",
        routePoints: [
          {
            id: "day3-start",
            name: "Framingham State University",
            address: "100 State St, Framingham, MA 01702",
            coordinates: { lat: 42.2794, lng: -71.4163 },
            type: "start",
            description: "Starting from Framingham State University"
          },
          {
            id: "day3-waypoint1",
            name: "Marlborough City Hall",
            address: "140 Main St, Marlborough, MA 01752",
            coordinates: { lat: 42.3459, lng: -71.5523 },
            type: "waypoint",
            description: "Rest stop at Marlborough City Hall"
          },
          {
            id: "day3-waypoint2",
            name: "Worcester Common",
            address: "Worcester Common, Worcester, MA 01608",
            coordinates: { lat: 42.2626, lng: -71.8023 },
            type: "waypoint",
            description: "Final rest stop at Worcester Common"
          },
          {
            id: "day3-end",
            name: "Worcester City Hall",
            address: "455 Main St, Worcester, MA 01608",
            coordinates: { lat: 42.2626, lng: -71.8023 },
            type: "end",
            description: "Final destination at Worcester City Hall"
          }
        ],
        polylinePath: ""
      },
      breakfast: {
        time: "7:00 AM",
        location: "Framingham State University",
        description: "Final march breakfast",
        providedBy: "Framingham State University Dining Services",
        notes: ""
      },
      lunch: {
        time: "12:00 PM",
        location: "Marlborough City Hall",
        description: "Lunch at Marlborough City Hall plaza",
        providedBy: "Marlborough Community Groups",
        notes: ""
      },
      dinner: {
        time: "6:00 PM",
        location: "Worcester City Hall",
        description: "Victory dinner and celebration",
        providedBy: "Worcester Community Organizations",
        notes: ""
      },
      specialEvents: [
        {
          id: "event-3-1",
          title: "Closing Ceremony",
          time: "7:00 PM",
          location: "Worcester City Hall",
          description: "Final rally and closing ceremony with community leaders",
          organizer: "March Organizing Committee"
        }
      ],
      marchers: ["marcher-1", "marcher-2", "marcher-3"],
      partnerOrganizations: ["org-1", "org-2"],
      vehicleSchedules: [
        {
          vehicleId: "vehicle-1",
          driver: "marcher-2",
          driverContact: "617-555-0103",
          notes: "Support vehicle for supplies and equipment"
        },
        {
          vehicleId: "vehicle-2",
          driver: "marcher-3",
          driverContact: "617-555-0105",
          notes: "Medical support vehicle"
        },
        {
          vehicleId: "vehicle-3",
          driver: "marcher-1",
          driverContact: "617-555-0101",
          notes: "Media and communications vehicle"
        }
      ],
      dailyOrganizer: {
        name: "Sarah Chen",
        email: "sarah.chen@march.org",
        phone: "(617) 555-0103"
      },
      marchLeaderId: "marcher-2"
    }
  ],
  marchers: [
    {
      id: "marcher-1",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "617-555-0101",
      emergencyContact: "David Chen (617-555-0102)",
      dietaryRestrictions: "Vegetarian",
      notes: "Team leader, experienced marcher",
      medic: true,
      peacekeeper: true,
      marchingDays: ["day-1", "day-2", "day-3"]
    },
    {
      id: "marcher-2",
      name: "Marcus Rodriguez",
      email: "marcus.rodriguez@example.com",
      phone: "617-555-0103",
      emergencyContact: "Maria Rodriguez (617-555-0104)",
      dietaryRestrictions: "None",
      notes: "Community organizer",
      medic: false,
      peacekeeper: true,
      marchingDays: ["day-1", "day-3"]
    },
    {
      id: "marcher-3",
      name: "Aisha Johnson",
      email: "aisha.johnson@example.com",
      phone: "617-555-0105",
      emergencyContact: "James Johnson (617-555-0106)",
      dietaryRestrictions: "Gluten-free",
      notes: "Student activist",
      medic: true,
      peacekeeper: false,
      marchingDays: ["day-2", "day-3"]
    }
  ],
  partnerOrganizations: [
    {
      id: "org-1",
      name: "Massachusetts Community Action Network",
      description: "Statewide network of community organizations working for social justice",
      website: "https://mcan.org",
      contactPerson: "Jennifer Williams",
      contactEmail: "jennifer@mcan.org",
      contactPhone: "617-555-0201",
      partnerDays: ["day-1", "day-3"]
    },
    {
      id: "org-2",
      name: "Worcester Community Coalition",
      description: "Coalition of Worcester-area community groups and activists",
      website: "https://worcestercommunity.org",
      contactPerson: "Robert Thompson",
      contactEmail: "robert@worcestercommunity.org",
      contactPhone: "508-555-0202",
      partnerDays: ["day-2", "day-3"]
    }
  ],
  vehicles: [
    {
      id: "vehicle-1",
      name: "Support Van",
      description: "15-passenger van for supplies, equipment, and support personnel",
      licensePlate: "MA-12345",
      responsiblePerson: "Sarah Chen",
      vehicleDays: ["day-1", "day-2", "day-3"]
    },
    {
      id: "vehicle-2",
      name: "Medical Support Vehicle",
      description: "SUV equipped with first aid supplies and medical equipment",
      licensePlate: "MA-67890",
      responsiblePerson: "Aisha Johnson",
      vehicleDays: ["day-2", "day-3"]
    },
    {
      id: "vehicle-3",
      name: "Media Vehicle",
      description: "Van for media equipment, communications gear, and press support",
      licensePlate: "MA-11111",
      responsiblePerson: "Marcus Rodriguez",
      vehicleDays: ["day-3"]
    }
  ]
}; 