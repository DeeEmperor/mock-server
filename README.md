# MockFlow 🚀

MockFlow is a powerful, self-hosted Mock API Server designed for developers who need reliable, dynamic, and low-latency mock endpoints for testing and prototyping.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✨ Features

- **Dynamic Routing**: Define mock endpoints with ease using the intuitive React dashboard.
- **Latency Simulation**: Simulate real-world network conditions by adding custom delays to your mock responses.
- **History Tab**: Keep track of all incoming requests to your mock server with a detailed log of headers, body, and query parameters.
- **Faker Integration**: Generate realistic mock data on the fly using built-in Faker.js templates.
- **Universal Build**: A unified architecture that serves the frontend and backend from a single Node.js instance.

## 🚀 Self-Hosting Guide

### 1. Fork the Repository

Click the **Fork** button at the top right of this page to create your own copy of the MockFlow repository.

### 2. Set Up MongoDB Atlas

MockFlow requires a MongoDB database to store your mock configurations and logs.

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (the Shared Tier is free).
3. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere) to ensure Render can connect.
4. In **Database Access**, create a user with read/write permissions.
5. Copy your **Connection String** (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/mockflow`).

### 3. Deploy to Render

1. Click the **Deploy to Render** button above.
2. Connect your GitHub account and select your forked repository.
3. Render will automatically detect the `render.yaml` file.
4. When prompted, enter your `MONGODB_URI` (the connection string from Step 2).
5. Once the build is complete, your private MockFlow instance will be live!

## 🛠️ Local Development

If you want to run MockFlow locally:

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mock-server.git
   cd mock-server
   ```
2. Install all dependencies:
   ```bash
   npm run install-all
   ```
3. Create a `.env` file in the backend directory or root:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```
4. Start the development environment:
   ```bash
   npm run dev
   ```

---

Built with ❤️ for the Developer Community.
