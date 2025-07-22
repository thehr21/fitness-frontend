# Wellness Frontend

This is the completed frontend of **Wellness**, a final-year mobile app that helps users build healthy habits through meal logging, workout tracking, achievements, and habit suggestions.

## ✅ Key Features

- 🍽️ Meal planning with suggestions from Spoonacular API
- 🏋️ Workout selection by type (Home/Gym) and muscle group (via ExerciseDB)
- 📈 Meal and workout logging for tracking consistency
- 🧠 AI-powered habit suggestions shown on the dashboard
- 🏆 Achievement badges and streak progress
- 👥 Community feed with posts, likes, and comments
- 👤 Profile management and picture uploads

## 🛠️ Tech Stack

- React Native with Expo
- TypeScript
- Spoonacular & ExerciseDB APIs
- Connected to FastAPI backend

## 📁 Folder Overview

fitness-frontend/
├── app/
│ ├── ai-feedback/ # AI suggestion display
│ ├── auth/ # Login/Register/Forgot Password
│ ├── community/ # Community posts
│ ├── gamification/ # Streaks & Achievements
│ ├── home/ # Dashboard with AI feedback
│ ├── meals/ # Meal planning & logging
│ ├── profile/ # Profile screen
│ ├── workouts/ # Workout planning & logging
├── assets/ # Icons and images
├── App.tsx # Root app component

##  Notes
This frontend connects to the Wellness+ backend built with FastAPI.

All major features including AI suggestions and gamification were implemented.

This project was submitted as a final-year university project and is not intended for production use.


## 🚀 How to Run the App

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start

