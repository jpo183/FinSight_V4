# FinSight V4

A financial analytics dashboard application built with React and Express.

## Project Overview

FinSight is a web application that provides:
- Sales analytics dashboard
- HubSpot integration
- OpenAI integration
- Configuration management

## Project Structure 

├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ ├── styles/
│ │ └── services/
│ └── package.json
├── server/ # Express backend
│ ├── server.js
│ └── package.json
└── README.md

## Tech Stack

- Frontend: React, Material-UI
- Backend: Node.js, Express
- APIs: HubSpot, OpenAI

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup

bash
cd server
npm install
Create .env file with required environment variables
npm start
Setup
bash
cd client
npm install
npm start


### Environment Variables

#### Server (.env)

PORT=3001
API_KEY=your_default_api_key
HOST_URL=http://localhost:3001
DATABASE_URL=your_database_url
HUBSPOT_API_KEY=your_hubspot_api_key
OPENAI_API_KEY=your_openai_api_key


#### Client (.env)
## Development
To start development servers:

1. Start backend:
bash
cd server
npm run dev


2. Start frontend:
bash
cd client
npm start


## Deployment

### Frontend
- Build the React app: `npm run build`
- Deploy the `build` folder to your hosting service

### Backend
- Ensure all environment variables are set
- Deploy the server code to your hosting service

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details