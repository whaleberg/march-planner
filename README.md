# March Organizer

A comprehensive web application for organizing long-distance marches with detailed route planning, participant management, and schedule coordination.

## Features

- **Route Planning**: Plan multi-day marches with detailed route information
- **Participant Management**: Manage marchers and partner organizations
- **Schedule Coordination**: Assign participants to specific days
- **Map Integration**: Visual route planning with Google Maps
- **Data Persistence**: Export/import march data
- **Responsive Design**: Works on desktop and mobile devices

## Map Integration

The app now includes Google Maps integration for visual route planning:

### Setup

1. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
   - Places API
3. Create a `.env` file in the project root and add:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### Features

- **Overview Map**: See the complete march route from start to finish
- **Day Detail Maps**: View detailed routes for each day with stops and waypoints
- **Route Editor**: Add, edit, and manage route points including:
  - Start/end points
  - Waypoints
  - Stops with estimated arrival times
  - Route descriptions and notes
- **Automatic Route Calculation**: Distance and duration automatically calculated
- **Interactive Maps**: Click to add new route points
- **Route Visualization**: Polylines showing the exact route path

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables:
   ```bash
   npm run setup
   ```
   This will create a `.env` file with the required environment variables.
4. Get a Google Maps API key from the [Google Cloud Console](https://console.cloud.google.com/)
5. Enable the following APIs in your Google Cloud Console:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
   - Places API
6. Update the `VITE_GOOGLE_MAPS_API_KEY` in your `.env` file with your actual API key
7. Start the development server: `npm run dev`
8. Open http://localhost:5173 in your browser

## Usage

### Overview Page
- View march statistics and summary
- See the complete route on an interactive map
- Access quick links to manage days, marchers, and organizations

### Day Management
- Add, edit, and delete march days
- Insert days in the middle of the schedule
- Automatic date and route continuity updates

### Day Detail Pages
- View and edit route information
- Use the interactive map to plan detailed routes
- Add waypoints and stops with estimated times
- Manage meals and special events
- View scheduled marchers and partner organizations

### Marcher/Organization Management
- Add participants with contact information
- Schedule participants for specific days
- View dietary restrictions and notes

## Data Management

- **Export**: Download your march data as JSON
- **Import**: Load previously exported data
- **Reset**: Return to sample data
- **Auto-save**: Data is automatically saved to localStorage

## Technologies Used

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Google Maps JavaScript API
- Lucide React for icons

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx   # Main navigation
│   ├── Overview.tsx     # March overview page
│   ├── DayDetail.tsx    # Individual day details
│   ├── MarchersPage.tsx # Marchers management
│   └── OrganizationsPage.tsx # Partner organizations
├── context/             # React context
│   └── MarchContext.tsx # Global state management
├── data/                # Sample data
│   └── sampleData.ts    # Initial march data
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## Data Structure

The application uses a comprehensive data structure to manage all march information:

### March Data
- Basic march information (title, description, dates)
- Array of march days
- Array of marchers
- Array of partner organizations

### March Day
- Route information (start/end points, distance, duration)
- Meal details (breakfast, lunch, dinner)
- Special events
- Associated marchers and organizations

### Marcher
- Personal information (name, email, phone)
- Emergency contact
- Dietary restrictions
- Notes

### Partner Organization
- Organization details (name, description, website)
- Contact information (person, email, phone)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 