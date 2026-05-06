# Questifinal ⚔️

Questifinal is a gamified task management application designed to turn your daily chores into an epic adventure. Built with **React Native** and **Expo** on the frontend, and **FastAPI** on the backend, it combines productivity with RPG-like progression.

## 🚀 Features

-   **Gamified Task Management**: Create tasks with varying difficulty levels (EASY, MEDIUM, HARD). Completing tasks earns you XP and helps you level up!
-   **User Authentication**: Secure sign-in using Google Authentication powered by Firebase.
-   **Leveling System**: Track your progress with a dedicated leveling system stored in a FastAPI backend.
-   **Focus Timer**: Built-in Pomodoro-style timer to help you stay focused on your quests.
-   **Modern UI/UX**: Sleek, responsive design with smooth animations using **Moti** and **Lottie**.
-   **Cross-Platform**: Designed for Android and iOS using Expo.

## 🛠️ Tech Stack

### Frontend
-   **React Native / Expo**: Core framework.
-   **Expo Router**: File-based navigation.
-   **Google Sign-In**: Authentication.
-   **Moti & Reanimated**: High-performance animations.
-   **Lottie**: Vector-based animations.
-   **Expo AV**: Audio feedback for task completion.

### Backend
-   **FastAPI**: High-performance Python web framework.
-   **SQLAlchemy**: ORM for database management.
-   **SQLite**: Local development database.
-   **Uvicorn**: ASGI server.

## 📦 Installation

### Prerequisites
-   [Node.js](https://nodejs.org/) (LTS)
-   [Python 3.9+](https://www.python.org/)
-   [Expo CLI](https://docs.expo.dev/get-started/installation/)

### 1. Clone the repository
```bash
git clone https://github.com/gauresh-7/questifinal.git
cd questifinal
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start the Expo development server
npm start
```

### 3. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload
```

## 📂 Project Structure

```
Questifinal/
├── app/                # Frontend application logic (Expo Router)
│   ├── (tabs)/         # Main tab-based navigation
│   ├── _layout.tsx     # Root layout
│   └── userAuth.tsx    # Auth logic
├── backend/            # FastAPI backend
│   ├── routers/        # API route handlers
│   ├── main.py         # App entry point
│   ├── models.py       # SQLAlchemy models
│   └── database.py     # DB configuration
├── assets/             # Images, fonts, and lottie files
├── store.ts            # Global state management
└── app.json            # Expo configuration
```

## 🚀 Deployment

-   **Backend**: Pre-configured for deployment on **Railway** via `railway.toml`.
-   **Frontend**: Can be built into an APK/IPA using **EAS Build**.

## 📄 License

This project is private. Developed by Gauresh.
