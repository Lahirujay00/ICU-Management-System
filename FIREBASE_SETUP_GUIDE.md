# Firebase Google Authentication Setup Guide

## Overview
This guide will help you complete the setup of Firebase Google Authentication for admin access to the ICU Management System.

## Prerequisites
- Firebase project created with the API key: `AIzaSyDcPn7YWsQjG3QT42aqhuDUc9miTaqziHo`
- Google Cloud Console access
- Admin access to your Firebase project

## Step-by-Step Setup

### 1. Complete Firebase Project Configuration

You need to update the following values in `/frontend/.env.local` with your actual Firebase project details:

```env
# Current placeholder values - REPLACE WITH YOUR ACTUAL VALUES:
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=icu-management-system.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=icu-management-system
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=icu-management-system.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefghijklmnop
```

**To get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on your web app or create one if you haven't
6. Copy the config values to your `.env.local` file

### 2. Enable Google Authentication in Firebase

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Toggle **Enable**
4. Set your project's public-facing name
5. Choose a support email
6. Click **Save**

### 3. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (same as Firebase project)
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `https://icu-management-system-front.vercel.app`
   - `http://localhost:3001`
   - Your production domain (when deploying)
7. Add authorized redirect URIs:
   - `https://icu-management-system-front.vercel.app/api/auth/callback/google`
   - `http://localhost:3001/api/auth/callback/google`
   - Your production domain callback URL
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 4. Update Environment Variables

Add your Google OAuth credentials to `/frontend/.env.local`:

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret-here
```

### 5. Configure Admin Access

Update the admin email list in `/frontend/src/app/api/auth/[...nextauth]/route.js`:

```javascript
const adminEmails = [
  'admin@icu.com',
  'doctor@icu.com',
  'nurse@icu.com',
  'your-actual-gmail@gmail.com', // Add your Gmail here
  // Add other authorized admin emails
];
```

### 6. Test the Setup

1. Start your development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Go to `https://icu-management-system-front.vercel.app` or `http://localhost:3001`
3. Click "Sign in with Google"
4. Use a Gmail account that's in your admin list
5. You should be redirected to the dashboard if successful

## Security Considerations

### For Production:

1. **Environment Variables**: Never commit real API keys to version control
2. **Admin Email Validation**: Consider storing admin emails in your database instead of hardcoding
3. **Domain Restrictions**: Limit OAuth redirect URIs to your actual domains
4. **HTTPS**: Always use HTTPS in production
5. **Firebase Security Rules**: Configure proper security rules for your Firebase project

### Current Admin Email List:

Currently configured admin emails (update these in the NextAuth config):
- `admin@icu.com` (demo account)
- `doctor@icu.com` (demo account)  
- `nurse@icu.com` (demo account)
- `your-gmail@gmail.com` (replace with your actual Gmail)

## Troubleshooting

### Common Issues:

1. **"Error: Redirect URI mismatch"**
   - Add the correct redirect URI in Google Cloud Console
   - Format: `https://icu-management-system-front.vercel.app/api/auth/callback/google`

2. **"Firebase project not found"**
   - Verify your Firebase project ID in `.env.local`
   - Ensure the project exists in Firebase Console

3. **"Access denied" after Google sign-in**
   - Check if your email is in the `adminEmails` array
   - Verify the email comparison is case-sensitive

4. **"Invalid API key"**
   - Verify your Firebase API key is correct
   - Check if the API key has the necessary permissions

## File Changes Made

The following files have been created/modified:

1. `/frontend/.env.local` - Added Firebase and Google OAuth environment variables
2. `/frontend/src/lib/firebase.js` - Firebase configuration
3. `/frontend/src/app/api/auth/[...nextauth]/route.js` - Added Google provider and admin validation
4. `/frontend/src/components/auth/LoginForm.js` - Added Google sign-in button

## Next Steps

After completing the Firebase setup:

1. Replace placeholder values in `.env.local` with real Firebase config
2. Set up Google OAuth credentials 
3. Add your Gmail to the admin emails list
4. Test the authentication flow
5. Consider implementing database-based admin role management for production

For production deployment, ensure all environment variables are properly set in your hosting platform.
