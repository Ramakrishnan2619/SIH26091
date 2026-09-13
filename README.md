# VyapaarSathi

National Rural Enterprise Feasibility Assessment & Concessional Credit Portal  
Developed for the Ministry of Social Justice and Empowerment (MoSJE), Government of India.

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Institutional Apex Corporations](#institutional-apex-corporations)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running the Backend](#running-the-backend)
  - [Running the Frontend](#running-the-frontend)
- [Docker and Cloud Deployment](#docker-and-cloud-deployment)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About The Project

VyapaarSathi is a sovereign digital platform engineered to democratize institutional credit access for rural and marginalized entrepreneurs across India. By automating business feasibility assessments, local competitor density mapping, and statutory loan structuring, the platform enables aspiring entrepreneurs to generate bank-grade project dossiers without financial intermediaries or complex mathematical calculations.

The platform aligns directly with national apex corporation lending guidelines (NSFDC, NBCFDC, NSKFDC, NDFDC) to calculate concessional loan terms, margin money requirements, moratorium timelines, and subsidy eligibility.

---

## Key Features

- **Progressive Feasibility Assessment Wizard**: Intuitive three-step workflow capturing business concept, geographic location, and demographic profile.
- **Hyperlocal Market Demand Analysis**: Integration with Census LGD databases and Google Maps Places APIs to gauge nearby competitor density within a 10 km radius.
- **Automated Concessional Loan Structuring**: Real-time computation of reducing balance amortization schedules, 10% margin money rules, and debt service coverage metrics.
- **Scheme Matching Engine**: Intelligent eligibility matching across specialized central schemes (term loans, micro-credit finance, Mahila Samriddhi Yojana).
- **Interactive AI Credit Sahayak**: Conversational assistant powered by Google Vertex AI to explain repayment terms, grace periods, and regulatory compliances in vernacular languages.
- **Multilingual Support**: Fully localized interface supporting English, Hindi, Tamil, and Telugu.
- **Bank-Grade PDF Dossiers**: Instant generation of standardized project reports compliant with commercial bank and State Channelising Agency (SCA) filing criteria.

---

## System Architecture

The application is structured into a modern decoupled architecture:

1. **Client Layer**: Single-page application built with React, Vite, and Tailwind CSS.
2. **Application Server**: Spring Boot 3 REST API providing authentication, session management, and business logic execution.
3. **Data Layer**:
   - Primary relational datastore (JPA/Hibernate) for user records, assessment sessions, and chat logs.
   - High-speed local SQLite database containing Layer 2 Census and LGD village demographics.
4. **Intelligence and External Services**:
   - Google Vertex AI for personalized feasibility synthesis and SWOT modeling.
   - Google Maps Platform for reverse geocoding and competitive point-of-interest aggregation.

---

## Technology Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Lucide React (Icons)
- Canvas Confetti

### Backend
- Java 21
- Spring Boot 3.3
- Spring Security (JWT & Google OAuth 2.0)
- Spring Data JPA
- SQLite JDBC
- Maven

### Cloud & DevOps
- Google Cloud Run (Serverless Container Runtime)
- Google Artifact Registry
- Docker Multi-Stage Builds

---

## Institutional Apex Corporations

The platform incorporates underwriting parameters and concessional guidelines from:

- **NSFDC**: National Scheduled Castes Finance and Development Corporation
- **NBCFDC**: National Backward Classes Finance and Development Corporation
- **NSKFDC**: National Safai Karamcharis Finance and Development Corporation
- **NDFDC**: National Divyangjan Finance and Development Corporation

---

## Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure the following tools are installed on your workstation:

- Java Development Kit (JDK) 21 or higher
- Node.js 20.x or higher
- npm 10.x or higher
- Apache Maven 3.9 or higher
- Git

### Environment Variables

Create an `.env` file in the root directory or configure environment variables in your runtime environment. Refer to `.env.example` for details:

```env
PORT=8080
SPRING_PROFILES_ACTIVE=prod
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-256-bit-jwt-secret-key
GEMINI_API_KEY=your-vertex-ai-gemini-key
GOOGLE_MAPS_API_KEY=your-maps-places-api-key
LAYER2_DB_PATH=Optimized DB for Layer 2/village_census.db
```

### Running the Backend

1. Navigate to the project root directory:
   ```bash
   cd SIH
   ```

2. Build and run the Spring Boot application using Maven:
   ```bash
   mvn clean spring-boot:run
   ```

3. The backend service will start on `http://localhost:8080`.

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and access `http://localhost:5173`. The Vite dev server proxies `/api` requests to the configured backend.

---

## Docker and Cloud Deployment

### Multi-Stage Docker Build

The project includes a multi-stage `Dockerfile` that packages both the compiled React static assets and the Spring Boot JAR into a single, minimal runtime container.

To build the container image:

```bash
docker build -t vyapaarsathi:latest .
```

To run the container locally:

```bash
docker run -p 8080:8080 --env-file .env vyapaarsathi:latest
```

### Google Cloud Run Deployment

Deploy the container to Google Cloud Run using the Google Cloud SDK:

```bash
gcloud run deploy vyapaarsathi \
  --image asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/vyapaarsathi-repo/vyapaarsathi:latest \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1
```

---

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register new citizen or field officer account |
| `/api/auth/login` | `POST` | Authenticate with email/password and receive JWT |
| `/oauth2/authorization/google` | `GET` | Initiate Google OAuth 2.0 authentication flow |
| `/api/assess/autocomplete` | `GET` | Autocomplete village by prefix and state/district |
| `/api/assess/metrics` | `POST` | Fetch village demographics, population, and competitor density |
| `/api/assess/complete` | `POST` | Execute full feasibility assessment and loan structuring |
| `/api/finance/calculate` | `POST` | Compute 20-quarter amortization table and financial KPIs |
| `/api/schemes/search` | `POST` | Search matching apex corporation concessional schemes |
| `/api/chat/message` | `POST` | Send conversational query to AI Credit Sahayak |

---

## Contributing

Contributions are welcome and appreciated. To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m "Add NewFeature"`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

VyapaarSathi Project Team  
Repository: [https://github.com/Varghese778/SIH26091](https://github.com/Varghese778/SIH26091)
