import { dataService } from '../services/dataService';
import { PrismaClient } from '../prisma/generated/client';


export async function initializeSampleData() {
  const prisma = new PrismaClient();
  console.log('🚀 Initializing sample data...');

  // Create a sample march
  const marchResult = await dataService.createMarch({
    title: "March for Democracy 2024",
    description: "A historic march across Massachusetts to strengthen community bonds and demonstrate our commitment to democracy.",
    startDate: "2024-06-01",
    endDate: "2024-06-15",
    missionStatement: {
      title: "More than a march—a people's movement",
      subtitle: "Join us as we walk together, strengthening community bonds and demonstrating our commitment to democracy.",
      description: "Every step counts, every voice matters."
    },
    callToAction: {
      title: "Join the Movement",
      description: "Whether you can walk for an hour, a day, or the entire journey, your participation makes a difference."
    },
    itineraryDescription: "Join us for an hour, a day, a week, or the whole way. Each day offers unique opportunities to connect with communities and make your voice heard.",
    mapSettings: {
      defaultZoom: 8,
      mapCenter: {lat: 42.3601, lng: -71.0589}
    }
  });

  if (!marchResult.success) {
    console.error('Failed to create march:', marchResult.message);
    return;
  }

  const marchId = marchResult.data.id;
  console.log('✅ Created march:', marchResult.data.title);

  // Create sample marchers
  const marchers = [
    {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "555-0101",
      emergencyContact: "Jane Smith (555-0102)",
      dietaryRestrictions: "Vegetarian",
      notes: "Experienced hiker",
      medic: true,
      peacekeeper: false
    },
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "555-0201",
      emergencyContact: "Mike Johnson (555-0202)",
      dietaryRestrictions: "None",
      notes: "First-time marcher",
      medic: false,
      peacekeeper: true
    },
    {
      name: "David Wilson",
      email: "david.wilson@email.com",
      phone: "555-0301",
      emergencyContact: "Lisa Wilson (555-0302)",
      dietaryRestrictions: "Gluten-free",
      notes: "Local organizer",
      medic: true,
      peacekeeper: true
    }
  ];

  const marcherIds = [];
  for (const marcherData of marchers) {
    const result = await dataService.createMarcher(marcherData);
    if (result.success) {
      marcherIds.push(result.data.id);
      console.log('✅ Created marcher:', result.data.name);
    } else {
      console.error('Failed to create marcher:', result.message);
    }
  }

  // Create sample organizations
  const organizations = [
    {
      name: "Community Action Network",
      description: "A grassroots organization dedicated to community empowerment and civic engagement.",
      website: "https://communityaction.org",
      contactPerson: "Maria Rodriguez",
      contactEmail: "maria@communityaction.org",
      contactPhone: "555-1001"
    },
    {
      name: "Democracy Now Coalition",
      description: "Advocating for democratic reforms and civic participation across Massachusetts.",
      website: "https://democracynow.org",
      contactPerson: "Robert Chen",
      contactEmail: "robert@democracynow.org",
      contactPhone: "555-1002"
    }
  ];

  const organizationIds = [];
  for (const orgData of organizations) {
    const result = await dataService.createOrganization(orgData);
    if (result.success) {
      organizationIds.push(result.data.id);
      console.log('✅ Created organization:', result.data.name);
    } else {
      console.error('Failed to create organization:', result.message);
    }
  }

  // Create sample vehicles
  const vehicles = [
    {
      name: "Support Van 1",
      type: "van" as const,
      capacity: 8,
      driver: "John Smith",
      driverPhone: "555-0101",
      licensePlate: "MA-12345",
      notes: "Primary support vehicle"
    },
    {
      name: "Medical Van",
      type: "van" as const,
      capacity: 6,
      driver: "David Wilson",
      driverPhone: "555-0301",
      licensePlate: "MA-67890",
      notes: "Medical support and first aid"
    }
  ];

  const vehicleIds = [];
  for (const vehicleData of vehicles) {
    const result = await dataService.createVehicle(vehicleData);
    if (result.success) {
      vehicleIds.push(result.data.id);
      console.log('✅ Created vehicle:', result.data.name);
    } else {
      console.error('Failed to create vehicle:', result.message);
    }
  }

  // Create sample march days
  const marchDays = [
    {
      marchId,
      date: "2024-06-01",
      route: {
        startPoint: "Boston Common",
        endPoint: "Cambridge City Hall",
        routePoints: [
          {
            id: "point-1",
            name: "Boston Common",
            coordinates: {lat: 42.3554, lng: -71.0656},
            type: "start" as const,
            description: "Starting point of the march"
          },
          {
            id: "point-2",
            name: "Cambridge City Hall",
            coordinates: {lat: 42.3736, lng: -71.1097},
            type: "end" as const,
            description: "End point for day 1"
          }
        ]
      },
      breakfast: {
        location: "Boston Common",
        time: "07:00",
        description: "Light breakfast provided by local volunteers"
      },
      lunch: {
        location: "MIT Campus",
        time: "12:00",
        description: "Lunch at MIT student center"
      },
      dinner: {
        location: "Cambridge Community Center",
        time: "18:00",
        description: "Community dinner and discussion"
      },
      specialEvents: [
        {
          id: "event-1",
          title: "Opening Ceremony",
          description: "Official start of the march with speeches and community gathering",
          time: "08:00",
          location: "Boston Common"
        }
      ],
      dailyOrganizer: {
        name: "Maria Rodriguez",
        email: "maria@communityaction.org",
        phone: "555-1001"
      }
    },
    {
      marchId,
      date: "2024-06-02",
      route: {
        startPoint: "Cambridge City Hall",
        endPoint: "Waltham Town Center",
        routePoints: [
          {
            id: "point-3",
            name: "Cambridge City Hall",
            coordinates: {lat: 42.3736, lng: -71.1097},
            type: "start" as const,
            description: "Starting point for day 2"
          },
          {
            id: "point-4",
            name: "Waltham Town Center",
            coordinates: {lat: 42.3765, lng: -71.2356},
            type: "end" as const,
            description: "End point for day 2"
          }
        ]
      },
      breakfast: {
        location: "Cambridge Community Center",
        time: "07:00",
        description: "Breakfast provided by local businesses"
      },
      lunch: {
        location: "Watertown Square",
        time: "12:00",
        description: "Lunch at local park"
      },
      dinner: {
        location: "Waltham Community Center",
        time: "18:00",
        description: "Community dinner and evening program"
      },
      specialEvents: [
        {
          id: "event-2",
          title: "Community Forum",
          description: "Discussion on local democracy and civic engagement",
          time: "19:00",
          location: "Waltham Community Center"
        }
      ]
    }
  ];

  const dayIds = [];
  for (const dayData of marchDays) {
    const result = await dataService.createMarchDay(dayData);
    if (result.success) {
      dayIds.push(result.data.id);
      console.log('✅ Created march day:', result.data.date);
    } else {
      console.error('Failed to create march day:', result.message);
    }
  }

  // Create marcher-day assignments
  for (let i = 0; i < marcherIds.length; i++) {
    for (let j = 0; j < dayIds.length; j++) {
      const result = await dataService.createMarcherDayAssignment({
        marcherId: marcherIds[i],
        dayId: dayIds[j],
        marchId,
        role: i === 0 ? "organizer" : "participant",
        notes: `Assignment for day ${j + 1}`
      });
      if (result.success) {
        console.log(`✅ Created marcher assignment: ${marchers[i].name} for day ${j + 1}`);
      }
    }
  }

  // Create organization-day assignments
  for (let i = 0; i < organizationIds.length; i++) {
    for (let j = 0; j < dayIds.length; j++) {
      const result = await dataService.createOrganizationDayAssignment({
        organizationId: organizationIds[i],
        dayId: dayIds[j],
        marchId,
        role: "host",
        contribution: `Hosting day ${j + 1} activities`,
        notes: `Organization support for day ${j + 1}`
      });
      if (result.success) {
        console.log(`✅ Created organization assignment: ${organizations[i].name} for day ${j + 1}`);
      }
    }
  }

  // Create vehicle-day schedules
  for (let i = 0; i < vehicleIds.length; i++) {
    for (let j = 0; j < dayIds.length; j++) {
      const result = await dataService.createVehicleDaySchedule({
        vehicleId: vehicleIds[i],
        dayId: dayIds[j],
        marchId,
        startTime: "06:00",
        endTime: "20:00",
        route: `Support route for day ${j + 1}`,
        purpose: i === 0 ? "General support" : "Medical support",
        driver: vehicles[i].driver,
        notes: `Vehicle schedule for day ${j + 1}`
      });
      if (result.success) {
        console.log(`✅ Created vehicle schedule: ${vehicles[i].name} for day ${j + 1}`);
      }
    }
  }

  console.log('🎉 Sample data initialization complete!');
  console.log(`📊 Created: ${marcherIds.length} marchers, ${organizationIds.length} organizations, ${vehicleIds.length} vehicles, ${dayIds.length} march days`);
  for (let i = 0; i < 5; i++) {
    await prisma.participant.create({
    data: {
      name: `John the ${i}th`,
      email: `test${i}@test.org`,
      phone: '987654',
      emergencyContact: '123456',
    }
  });
  }

  const participants = await prisma.participant.findMany();
  console.log(participants);
} 