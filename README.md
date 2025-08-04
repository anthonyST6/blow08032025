# Seraphim Vanguards Platform

A comprehensive AI-powered platform for enterprise operations management, featuring advanced agent orchestration, workflow automation, and real-time monitoring capabilities.

## Overview

The Seraphim Vanguards platform provides a unified interface for managing complex enterprise operations through:

- **Mission Control Enhanced**: Platform-level single pane of glass for overall system management
- **Mission Operations Center**: Use case-specific dashboards for targeted operations
- **Agent Orchestration**: Drag-and-drop interface for building AI agent workflows
- **Real-time Monitoring**: Comprehensive logging, auditing, and performance tracking

## Key Features

### 🎯 Mission Control Enhanced
- Executive summaries with real-time metrics
- Unified dashboard for all platform operations
- Single pane of glass architecture
- Interactive data visualization

### 🏭 Use Case: Oilfield Operations
- Lease performance monitoring
- Production optimization workflows
- Automated data ingestion and analysis
- Real-time alerts and notifications

### 🤖 Agent Orchestration
- Visual workflow builder
- Pre-built agent templates
- Custom agent creation
- Drag-and-drop interface

### 📊 Data Management
- Automated data ingestion
- Mock data for demonstrations
- Real-time data processing
- Export capabilities

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Custom Vanguard Blue and Seraphim Gold theme

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd "Seraphim Vanguards Kilo Dev"
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd packages/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env` in both frontend and backend directories
- Configure your Firebase credentials

### Running the Application

1. Start the backend server:
```bash
cd packages/backend
npm run dev
```

2. Start the frontend development server:
```bash
cd packages/frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
Seraphim Vanguards Kilo Dev/
├── packages/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   │   ├── components/   # Reusable components
│   │   │   ├── pages/        # Page components
│   │   │   ├── services/     # API services
│   │   │   └── styles/       # Global styles
│   │   └── ...
│   └── backend/           # Node.js backend server
│       ├── src/
│       │   ├── agents/       # AI agent implementations
│       │   ├── routes/       # API routes
│       │   ├── schemas/      # Data schemas
│       │   └── utils/        # Utility functions
│       └── ...
├── docs/                  # Documentation
└── README.md             # This file
```

## Usage

### Demo Mode
The platform includes a comprehensive demo mode with mock data:

1. Navigate to Mission Control Enhanced
2. Select "Oilfield Operations" use case
3. Click "Load Sample Data" to populate with demo information
4. Explore the various sections and workflows

### Creating Workflows
1. Go to the Agent Orchestration section
2. Drag agents from the sidebar to the canvas
3. Connect agents to create workflows
4. Configure agent parameters
5. Deploy and monitor execution

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions, please contact the development team.

---

Built with ❤️ by the Seraphim Vanguards Team