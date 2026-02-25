# EasyStore: Backend API Service 🚀

Core microservice for the **EasyStore** platform. This service manages business logic, user authentication, and database state. It is designed to run as a stateless container within a high-availability Kubernetes ecosystem.

> **Infrastructure Notice:** For details regarding AKS, Azure CNI Overlay, and Gateway API, please refer to the [Main Project Blueprint](https://github.com/denismironiuk/easy-store-main).

---

## 🛠 Tech Stack
* **Runtime**: Node.js 22+
* **Framework**: Express.js
* **Database**: MongoDB Atlas (Cloud-managed)
* **Caching**: Redis
* **Security**: JWT (JSON Web Tokens), Bcrypt
* **Testing**: Jest & Supertest (Integration Testing)

---

## 🏗 Backend CI/CD Pipeline
The service is fully automated via Jenkins pipelines:
1. **Quality Gate**: Automated linting with ESLint and integration tests with Jest.
2. **Containerization**: Secure, rootless builds using **Kaniko**.
3. **Deployment**: Automated image tag updates in the GitOps repository for **ArgoCD** synchronization.

---

## 🔒 Reliability & Security
* **Secret Management**: All sensitive credentials (MongoDB URI, JWT Secrets) are injected at runtime via Kubernetes Secrets.
* **Health Monitoring**: Configured Readiness and Liveness probes for self-healing and zero-downtime updates.
* **12-Factor Compliance**: Environment-based configuration for seamless portability between clusters.
* **Resource Optimization**: Defined CPU/Memory requests and limits to ensure cluster stability.

---

## 💻 Local Development

### Prerequisites
* Node.js 22+
* Access to a MongoDB instance

### Setup
1. **Install Dependencies**:
   ```bash
   npm install
2. **Environment Variables**:
     Create a .env file:
   ```
   PORT=8081
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_secret

3. **Run Server:**
   ```
   # Production mode
      npm start

    # Development mode
      npm run dev
4. **Run Tests:**
   ```
   npm run test
