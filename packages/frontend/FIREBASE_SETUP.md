# Firebase Setup Instructions

To properly configure Firebase for the Seraphim Vanguard frontend application, follow these steps:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - Email/Password
   - (Optional) Google, GitHub, or other providers as needed

## 3. Create a Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" for development
4. Select your preferred location

## 4. Get Your Firebase Configuration

1. Go to Project Settings (gear icon) > General
2. Scroll down to "Your apps" section
3. Click "Add app" and select "Web" (</> icon)
4. Register your app with a nickname (e.g., "Seraphim Vanguard Frontend")
5. Copy the Firebase configuration object

## 5. Update Environment Variables

Update the `packages/frontend/.env` file with your Firebase configuration:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## 6. (Optional) Set Up Firebase Emulators for Local Development

If you want to use Firebase emulators for local development:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize Firebase in your project: `firebase init`
3. Select Emulators and choose:
   - Authentication Emulator
   - Firestore Emulator
4. Set `VITE_USE_FIREBASE_EMULATORS=true` in your `.env` file
5. Start emulators: `firebase emulators:start`

## 7. Configure Firestore Security Rules

Create appropriate security rules for your Firestore database. Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add more rules as needed for your collections
  }
}
```

## 8. Deploy Security Rules

Deploy your security rules to Firebase:

```bash
firebase deploy --only firestore:rules
```

## Important Notes

- Never commit your actual Firebase configuration to version control
- Use environment variables for all sensitive configuration
- Consider using different Firebase projects for development, staging, and production
- Regularly review and update your security rules
- Monitor your Firebase usage to avoid unexpected charges