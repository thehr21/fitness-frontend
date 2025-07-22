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

app/
├── (tabs)/ # Tab navigation (Dashboard, Meal, Workout, etc.)
│ ├── index.tsx # Dashboard screen
│ ├── meal-planning.tsx # Meal suggestion & logging
│ ├── workout-plan.tsx # Workout selection & logging
│ ├── community.tsx # Community screen
│ ├── Gamification.tsx # Achievements and streaks
├── CreatePost.tsx # New post screen
├── CommentSection.tsx # Comment UI
├── PostItem.tsx # Post rendering
├── logged-meals.tsx # View logged meals
├── LoggedExercisesScreen.tsx
├── SuggestionCard.tsx # AI suggestion display
├── recipe.tsx # Full recipe view
├── profile.tsx # User profile
├── login.tsx
├── register.tsx / 0 / 1 / 2 # Registration steps
├── forget-password.tsx
├── reset-password.tsx
├── welcome.tsx # Intro screen


##  Notes
This frontend connects to the Wellness backend built with FastAPI.

All major features including AI suggestions and gamification were implemented.

This project was submitted as a final-year university project and is not intended for production use.


## 🚀 How to Run the App

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start

