# Cloud-Native E-Commerce Backend 🚀

This is a production-ready Node.js backend for an e-commerce platform, built with a strong focus on DevOps best practices, CI/CD automation, and high availability.

## 🛠 Tech Stack
* **Application:** Node.js, Express, MongoDB (Atlas), Redis
* **CI/CD:** Jenkins (Pipeline as Code), Docker, Kaniko
* **GitOps & Delivery:** ArgoCD, Kustomize
* **Infrastructure:** Kubernetes (AKS), Gateway API, Cilium CNI
* **Autoscaling:** KEDA (Event-driven scaling based on Redis metrics)
* **Testing & Quality:** Jest, Supertest, In-Memory MongoDB (Quality Gates)
* **Observability:** Prometheus, Grafana

## 🏗 Architecture & GitOps Flow
1. Developer pushes code to this repository.
2. **Jenkins** triggers a build, runs **Integration Tests (Jest)** in a temporary environment.
3. If tests pass, Jenkins uses **Kaniko** to build and push the Docker image.
4. Jenkins automatically updates the image tag in the separate **GitOps repository**.
5. **ArgoCD** detects the change and synchronizes the AKS cluster state with the Git repository.

## 🔒 Security & Best Practices Implemented
* **No credentials in code:** All secrets are managed via Kubernetes Secrets.
* **Fail-Fast CI/CD:** Pipeline stops immediately if unit/integration tests fail.
* **Resource Management:** Configured CPU/Memory requests and limits for all Pods.
* **Zero Downtime:** Configured Readiness and Liveness probes.

## 🏃‍♂️ How to Run Locally
```bash
# Install dependencies
npm install

# Run tests
npm run test

# Start the server (Requires local Redis & MongoDB URI in .env)
npm start