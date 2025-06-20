const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const { 
  authenticateToken, 
  requireRole, 
  login, 
  validateToken, 
  refreshToken, 
  logout 
} = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Data file path
const DATA_FILE = path.join(__dirname, 'data', 'march-data.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load data from file
async function loadData() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return null
      return null;
    }
    throw error;
  }
}

// Save data to file
async function saveData(data) {
  await ensureDataDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Sample data (fallback)
const sampleData = {
  title: "Massachusetts Unity March",
  description: "A 3-day march across eastern Massachusetts to promote community solidarity and social justice awareness.",
  startDate: "2024-06-15",
  endDate: "2024-06-17",
  mapSettings: {
    googleMapsApiKey: "",
    defaultZoom: 10,
    mapCenter: { lat: 42.3601, lng: -71.0589 }
  },
  days: [
    {
      id: "day-1",
      date: "2024-06-15",
      route: {
        startPoint: "Boston Common",
        endPoint: "Newton City Hall",
        terrain: "Urban sidewalks and park paths",
        notes: "Opening day through historic Boston and into Newton",
        routePoints: [
          {
            id: "day1-start",
            name: "Boston Common",
            address: "Boston Common, Boston, MA 02108",
            coordinates: { lat: 42.3554, lng: -71.0655 },
            type: "start",
            description: "Starting point at historic Boston Common"
          },
          {
            id: "day1-waypoint1",
            name: "Fenway Park",
            address: "4 Jersey St, Boston, MA 02215",
            coordinates: { lat: 42.3467, lng: -71.0972 },
            type: "waypoint",
            description: "Passing by historic Fenway Park"
          },
          {
            id: "day1-waypoint2",
            name: "Brookline Village",
            address: "Brookline Village, Brookline, MA 02445",
            coordinates: { lat: 42.3318, lng: -71.1212 },
            type: "waypoint",
            description: "Rest stop in Brookline Village"
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
        description: "Continental breakfast with coffee and pastries",
        providedBy: "Local Community Center"
      },
      lunch: {
        time: "12:00 PM",
        location: "Brookline Village",
        description: "Sandwiches and refreshments at local deli",
        providedBy: "Brookline Community Foundation"
      },
      dinner: {
        time: "6:00 PM",
        location: "Newton Community Center",
        description: "Community potluck dinner",
        providedBy: "Newton Community Groups"
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
      partnerOrganizations: ["org-1"]
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
      partnerOrganizations: ["org-2"]
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
        description: "Breakfast at university dining hall",
        providedBy: "Framingham State University"
      },
      lunch: {
        time: "12:00 PM",
        location: "Marlborough City Hall",
        description: "Lunch provided by local businesses",
        providedBy: "Marlborough Chamber of Commerce"
      },
      dinner: {
        time: "6:00 PM",
        location: "Worcester City Hall",
        description: "Closing celebration dinner",
        providedBy: "Worcester Community Foundation"
      },
      specialEvents: [
        {
          id: "event-3-1",
          title: "Closing Ceremony",
          time: "7:00 PM",
          location: "Worcester City Hall",
          description: "Closing ceremony with community leaders and march participants",
          organizer: "March Organizing Committee"
        }
      ],
      marchers: ["marcher-1", "marcher-2", "marcher-3"],
      partnerOrganizations: ["org-1", "org-2", "org-3"]
    }
  ],
  marchers: [
    {
      id: "marcher-1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "555-0101",
      emergencyContact: "John Johnson - 555-0102",
      dietaryRestrictions: "Vegetarian",
      notes: "Experienced marcher, team leader",
      marchingDays: ["day-1", "day-2", "day-3"]
    },
    {
      id: "marcher-2",
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "555-0201",
      emergencyContact: "Lisa Chen - 555-0202",
      dietaryRestrictions: "None",
      notes: "First-time marcher, excited to participate",
      marchingDays: ["day-1", "day-3"]
    },
    {
      id: "marcher-3",
      name: "Maria Rodriguez",
      email: "maria.rodriguez@email.com",
      phone: "555-0301",
      emergencyContact: "Carlos Rodriguez - 555-0302",
      dietaryRestrictions: "Gluten-free",
      notes: "Community organizer, bringing local group",
      marchingDays: ["day-2", "day-3"]
    }
  ],
  partnerOrganizations: [
    {
      id: "org-1",
      name: "Boston Community Foundation",
      description: "Local foundation supporting community initiatives and social justice programs",
      website: "https://bostoncommunity.org",
      contactPerson: "Jennifer Smith",
      contactEmail: "jennifer@bostoncommunity.org",
      contactPhone: "555-1001",
      partnerDays: ["day-1", "day-3"]
    },
    {
      id: "org-2",
      name: "Wellesley College Student Activists",
      description: "Student organization promoting social justice and community engagement",
      website: "https://wellesley.edu/student-activists",
      contactPerson: "Alex Thompson",
      contactEmail: "athompson@wellesley.edu",
      contactPhone: "555-2001",
      partnerDays: ["day-2"]
    },
    {
      id: "org-3",
      name: "Worcester Community Foundation",
      description: "Foundation supporting local community development and social programs",
      website: "https://worcestercommunity.org",
      contactPerson: "David Wilson",
      contactEmail: "dwilson@worcestercommunity.org",
      contactPhone: "555-3001",
      partnerDays: ["day-3"]
    }
  ]
};

// Authentication Routes
app.post('/auth/login', login);
app.get('/auth/validate', authenticateToken, validateToken);
app.post('/auth/refresh', authenticateToken, refreshToken);
app.post('/auth/logout', authenticateToken, logout);

// API Routes (protected)
app.get('/api/march-data', async (req, res) => {
  try {
    const data = await loadData();
    if (data) {
      res.json(data);
    } else {
      res.json(sampleData);
    }
  } catch (error) {
    console.error('Error loading march data:', error);
    res.status(500).json({ error: 'Failed to load march data' });
  }
});

app.post('/api/march-data', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const data = req.body;
    
    // Basic validation
    if (!data || !Array.isArray(data.days) || !Array.isArray(data.marchers) || !Array.isArray(data.partnerOrganizations)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    await saveData(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving march data:', error);
    res.status(500).json({ error: 'Failed to save march data' });
  }
});

app.get('/api/march-data/export', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const data = await loadData();
    if (data) {
      res.json(data);
    } else {
      res.json(sampleData);
    }
  } catch (error) {
    console.error('Error exporting march data:', error);
    res.status(500).json({ error: 'Failed to export march data' });
  }
});

app.post('/api/march-data/import', authenticateToken, requireRole(['admin', 'editor']), async (req, res) => {
  try {
    const data = req.body;
    
    // Basic validation
    if (!data || !Array.isArray(data.days) || !Array.isArray(data.marchers) || !Array.isArray(data.partnerOrganizations)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    await saveData(data);
    res.json({ success: true });
  } catch (error) {
    console.error('Error importing march data:', error);
    res.status(500).json({ error: 'Failed to import march data' });
  }
});

app.post('/api/march-data/reset', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    await saveData(sampleData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting march data:', error);
    res.status(500).json({ error: 'Failed to reset march data' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`March Organizer Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API base: http://localhost:${PORT}/api`);
  console.log(`Auth base: http://localhost:${PORT}/auth`);
}); 