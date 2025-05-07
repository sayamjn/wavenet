# CollabNotes - A Collaborative Notes Application

CollabNotes is a full-stack MERN application that allows users to create, edit, and share notes with role-based access control. The application features real-time collaboration using Socket.io, JWT authentication, and a responsive user interface.

## Features

- User authentication (signup/login) with JWT
- Create, update, and delete notes
- Share notes with other users (read/write permissions)
- Real-time collaboration using Socket.io
- Notifications when a shared note is updated
- Responsive UI with TailwindCSS
- Role-based access control on both frontend and backend
- Auto-archiving for old notes

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time updates
- JWT for authentication
- BCrypt for password hashing
- Node-cron for scheduling tasks
- Express Rate Limit for API protection

### Frontend

- React
- React Router for navigation
- Axios for API requests
- Socket.io-client for real-time communication
- React Hot Toast for notifications
- TailwindCSS for styling
- Context API for state management

## Project Structure

The project is divided into two main directories:

- `backend`: Contains the Node.js/Express server
- `frontend`: Contains the React application

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/sayamjn/wavenet.git
cd collabnotes
```

2. Set up the backend:

```bash
cd backend
.env  # Edit the .env file with your configuration
npm install
npm run dev
```

3. Set up the frontend:

```bash
cd frontend
.env  # Edit the .env file with your configuration
npm install
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Backend (.env)

```
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/collabnotes?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
LOG_LEVEL=info
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_SOCKET_URL=http://localhost:4000
REACT_APP_ENV=development
```

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `node server.js`
5. Add environment variables from your .env file

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Use the default build settings
4. Add environment variables for the production API URL

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)
- [TailwindCSS](https://tailwindcss.com/)