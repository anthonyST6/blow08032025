# Seraphim Vanguard Platform - Quick Start Guide

Welcome to the Seraphim Vanguard Platform! This guide will help you get up and running quickly.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Docker** & **Docker Compose** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

## 📥 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd seraphim-vanguards-kilo-dev
```

### 2. Run the Setup Script
```bash
# Make the script executable (Unix/Mac)
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh

# On Windows, use Git Bash or WSL
bash scripts/setup.sh
```

The setup script will:
- Check system requirements
- Create necessary directories
- Copy environment files
- Install dependencies
- Guide you through Firebase setup

### 3. Configure Environment Variables

#### Backend Configuration (`packages/backend/.env`)
```env
# Server
PORT=3001
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Security
JWT_SECRET=your-secure-jwt-secret
CORS_ORIGIN=http://localhost:5173
```

#### Frontend Configuration (`packages/frontend/.env`)
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=http://localhost:3001
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
# Backend only
cd packages/backend
npm run dev

# Frontend only (in another terminal)
cd packages/frontend
npm run dev
```

### Production Mode (Docker)
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## 🌐 Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **WebSocket**: ws://localhost:3001

## 👤 Default User Roles

The platform supports four user roles:
1. **Admin** - Full system access
2. **AI Risk Officer** - Risk assessment and monitoring
3. **Compliance Reviewer** - Compliance management
4. **User** - Basic access

### Creating Your First Admin User
1. Register a new account at http://localhost:5173/register
2. Use Firebase Console to add custom claims:
   ```javascript
   // In Firebase Console > Authentication > Users
   // Click on the user > Edit custom claims
   {
     "role": "admin"
   }
   ```

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Backend tests only
cd packages/backend
npm test

# Frontend tests only
cd packages/frontend
npm test

# E2E tests
npm run test:e2e
```

## 📊 Key Features

### 1. LLM Integration
- Support for OpenAI, Anthropic, and Azure OpenAI
- Unified interface for all providers
- Automatic retry and error handling

### 2. Vanguard Agents
Eight specialized AI agents for comprehensive validation:
- **Accuracy Agent** - Validates factual correctness
- **Bias Detection Agent** - Identifies potential biases
- **Red Flag Agent** - Detects harmful content
- **Volatility Agent** - Assesses output consistency
- **Explainability Agent** - Ensures transparency
- **Source Verifier Agent** - Validates information sources
- **Decision Tree Agent** - Maps decision logic
- **Ethical Alignment Agent** - Checks ethical compliance

### 3. Real-time Monitoring
- WebSocket-based real-time updates
- Live agent processing status
- Instant alerts and notifications

### 4. Workflow Automation
- Create custom validation workflows
- Schedule automated checks
- Chain multiple agents together

## 🛠️ Common Tasks

### Adding a New LLM Provider
1. Implement the provider in `packages/backend/src/services/llm.service.ts`
2. Add configuration to environment variables
3. Update the API documentation

### Creating a Custom Agent
1. Extend `BaseAgent` class in `packages/backend/src/agents/`
2. Implement the `analyze` method
3. Register in `packages/backend/src/agents/index.ts`

### Deploying to Production
```bash
# Use the deployment script
./scripts/deploy.sh production

# Or manually with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Firebase Authentication Errors**
   - Verify Firebase configuration in both .env files
   - Check Firebase Console for enabled authentication methods
   - Ensure domain is whitelisted in Firebase

3. **Docker Issues**
   ```bash
   # Reset Docker environment
   docker-compose down -v
   docker system prune -a
   ```

4. **TypeScript Errors**
   ```bash
   # Rebuild TypeScript
   npm run build
   ```

## 📚 Additional Resources

- [Full Documentation](./README.md)
- [API Documentation](http://localhost:3001/api-docs)
- [Security Checklist](./SECURITY_CHECKLIST.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Summary](./PROJECT_SUMMARY.md)

## 🆘 Getting Help

- **Issues**: Create a GitHub issue
- **Email**: support@seraphim-vanguard.com
- **Documentation**: Check the `/docs` folder

## 🎉 Next Steps

1. Explore the Admin Dashboard
2. Create your first prompt validation
3. Set up automated workflows
4. Review agent analysis results
5. Export compliance reports

Happy validating! 🛡️