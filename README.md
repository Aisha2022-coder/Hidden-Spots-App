# Hidden Spots – Location-Based Community Platform

**Hidden Spots** is a community-driven mobile platform where users can discover, share, and connect with unique and undiscovered locations in Gwalior, Madhya Pradesh. The app allows users to share personal stories, rate locations based on vibe, safety, and uniqueness, and find new places through an interactive map and curated feed.

---

## 🎬 Demo Video

https://drive.google.com/file/d/1_G2UTQgTUElDJldRdVuK2r9ByCK0ClnT/view?usp=sharing

---

## ✨ Features

- **Interactive Map:** Discover hidden spots on a map centered on Gwalior, with custom emoji markers for each vibe category.
- **Geolocation:** The app uses your location to show you nearby spots.
- **Spot Submission:** Easily add new spots with multiple photos, a personal story, a vibe category, and GPS location.
- **Detailed Spot Pages:** View photo galleries, read stories from other users, and see community ratings for vibe, safety, uniqueness, and crowd levels.
- **Community Ratings & Comments:** Rate spots on multiple criteria and share your own experiences through public or anonymous comments.
- **Curated Feed:** A feed that shows top-rated spots, making it easy to see what's popular in the community.
- **Secure Authentication:** Full user authentication system with email/password registration, login, and a secure auth guard to protect user content.
- **Moderation:** Users can flag inappropriate spots for admin review.
- **Performance Tested:** The application has been tested for API latency and frontend rendering speed.

---

## 🛠️ Tech Stack

| Layer         | Technology                     |
| ------------- | ------------------------------ |
| **Frontend**  | React Native + Expo            |
| **Location**  | Expo Location                  |
| **Maps**      | React Native Maps (Google Maps)|
| **Backend**   | Node.js + Express.js           |
| **Database**  | MongoDB (with Mongoose)        |
| **Image Storage**| Cloudinary                     |
| **Authentication**| JWT (JSON Web Tokens)          |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- A MongoDB database URI (e.g., from MongoDB Atlas)
- A Cloudinary account for image storage

### 1. Clone the Repository

```sh
git clone [Your GitHub Repository URL]
cd Hidden-Spots-App
```

### 2. Setup the Backend

1.  Navigate to the `server` directory:
    ```sh
    cd server
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add the following environment variables:
    ```env
    MONGO_URI=[Your MongoDB Connection String]
    JWT_SECRET=[A Secure Random String for JWT]
    CLOUDINARY_CLOUD_NAME=[Your Cloudinary Cloud Name]
    CLOUDINARY_API_KEY=[Your Cloudinary API Key]
    CLOUDINARY_API_SECRET=[Your Cloudinary API Secret]
    PORT=5000
    ```
4.  Start the backend server:
    ```sh
    npm start
    ```
    The server should now be running on `http://localhost:5000`.

### 3. Setup the Frontend

1.  In a new terminal, navigate to the `client` directory:
    ```sh
    cd client
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `client` directory and add the following:
    ```env
    EXPO_PUBLIC_API_BASE_URL=http://[Your Local IP Address]:5000
    ```
    > **Note:** Replace `[Your Local IP Address]` with your computer's local IP address (e.g., `192.168.1.10`) so that the Expo Go app can connect to your local backend server. Do not use `localhost`.

4.  Start the frontend application:
    ```sh
    npx expo start
    ```
5.  Scan the QR code with the Expo Go app on your mobile device.

---

## 🧪 Performance

For details on the application's performance, including API latency and map rendering speed, please see the [Performance Report](./performance.md).

---

## 👤 Author

- **AISHA GHOSH**
- https://github.com/Aisha2022-coder
- https://www.linkedin.com/in/aisha-ghosh-37a982258/