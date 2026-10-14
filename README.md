# FunnelLens — User Analytics & Session Intelligence

A lightweight, high-performance full-stack web analytics platform designed to capture, ingest, and visualize user behavioral telemetry (`page_view` and `click` interactions) in real time.

Built as an engineering assignment for the **Full Stack Engineer Internship** at **CausalFunnel**.

---

## 1. System Architecture

FunnelLens consists of four decoupled layers:
[ AuraStore Client Demo ]
│
▼ (Auto Page View & Viewport Click Capture)
[ Browser Tracking SDK (funnellens.js) ]
│
▼ HTTP POST /api/events (JSON payload)
[ Express.js REST API (Node.js) ]
│
▼ Mongoose Schema & Aggregation Pipeline
[ MongoDB Atlas (TimeSeries & Session Data) ]
│
▼ Aggregated Telemetry (Sessions, Events, Coordinates)
[ React (Vite) Analytics Dashboard ]


---

## 2. Core Capabilities

### Client-Side Tracking SDK (`tracker/funnellens.js`)
- **Session Persistence**: Generates unique UUIDs persisted via `localStorage` with fallback to `document.cookie` (30-day expiry).
- **Automated Page Views**: Immediately emits a `page_view` payload upon initialization.
- **Click Coordinates**: Attaches a capture-phase listener recording precise `clientX`, `clientY`, and viewport dimensions (`window.innerWidth`, `window.innerHeight`).
- **Resilient & Non-Blocking**: Dispatches asynchronous requests using `fetch` with `keepalive: true` without blocking main-thread user interactions.

### Ingestion Backend (`backend/`)
- Express REST API built with Node.js ES Modules.
- Strict input validation rejecting malformed payloads, non-HTTP URLs, or negative coordinates.
- Compound MongoDB indexing on `(sessionId, timestamp)` and `(pageUrl, eventType, timestamp)` for fast aggregation and queries.
- Endpoints for health monitoring, session aggregation, chronological event journeys, and page heatmap coordinate queries.

### Analytics Dashboard (`frontend/`)
- Built with **React** + **Vite** and styled with **Tailwind CSS**.
- **Executive Overview**: Total sessions, total events, page views, clicks, and recent session table.
- **User Journey Inspector**: Chronological step-by-step breakdown of individual session timelines with timestamps and coordinate tags.
- **Click Heatmap Canvas**: Normalizes pixel coordinates across heterogeneous device viewports into relative percentage placements ($x/W$, $y/H$).

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose, CORS, Dotenv |
| **Database** | MongoDB Atlas (Cloud) |
| **Tracking** | Standalone JavaScript SDK (`funnellens.js`) |
| **Demo App** | HTML5, Tailwind CSS |

---

## 4. API Specification

### Event Ingestion
- **POST** `/api/events`
  - Ingests user interactions (`page_view` or `click`).
  - Example Click Payload:
    ```json
    {
      "session_id": "fl-778cdea3-50e0-41a7-90e3-a8e29d854b4b",
      "event_type": "click",
      "page_url": "http://localhost:8080/",
      "timestamp": "2026-10-14T17:08:25.000Z",
      "x": 420,
      "y": 285,
      "viewport_width": 1440,
      "viewport_height": 900
    }
    ```
  - Response: `201 Created`

### Analytics Queries
- **GET** `/api/sessions` — Aggregates sessions, returning total events, page views, click counts, first seen, and last seen timestamps.
- **GET** `/api/sessions/:sessionId/events` — Returns the chronological event timeline for a single user journey.
- **GET** `/api/pages` — Summarizes distinct pages tracked and total click counts.
- **GET** `/api/pages/clicks?url=<encoded_url>` — Returns raw coordinates and viewport dimensions for heatmap rendering.
- **GET** `/api/health` — Service health and operational timestamp.

---

## 5. Local Setup Instructions

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or later)
- **MongoDB Atlas** cluster URI

### 1. Repository Setup
```bash
git clone <YOUR_REPOSITORY_URL>
cd FunnelLens
2. Environment Configuration
Create a .env file in the project root and in backend/:

Code snippet
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/funnellens?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:5173
3. Backend Launch
Bash
cd backend
npm install
npm run dev
# Server boots on http://localhost:5000
4. Frontend Launch
Bash
cd ../frontend
npm install
npm run dev
# Dashboard opens on http://localhost:5173
5. Interactive Demo Launch
Bash
cd ..
npx serve demo -p 8080
# Store demo available at http://localhost:8080
6. Engineering Assumptions & Trade-offs
Coordinate Normalization vs. Full DOM Snapshotting:

Trade-off: Full DOM recording (e.g., rrweb) captures dynamic layout shifts but introduces high data overhead and privacy complexities.

Implementation: FunnelLens captures viewport-relative coordinates and dimension metadata (window.innerWidth, window.innerHeight), mapping clicks proportionally to a fixed-aspect canvas.

Session Identification:

Uses persistent client UUIDs stored in localStorage with cookie fallback. For cross-subdomain enterprise analytics, cookies configured with Domain=.domain.com would be preferred.

Write Scalability:

For high-volume production deployments (>10k events/sec), an in-memory queue or buffer (such as Redis or Apache Kafka) can sit between the Express ingestion endpoint and MongoDB batch insertions.

7. Project Structure
FunnelLens/
├── README.md
├── .gitignore
├── .env.example
├── package.json
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── models/
│       │   └── Event.js
│       ├── routes/
│       │   ├── eventRoutes.js
│       │   ├── sessionRoutes.js
│       │   └── pageRoutes.js
│       ├── controllers/
│       │   ├── eventController.js
│       │   ├── sessionController.js
│       │   └── pageController.js
│       └── middleware/
│           └── errorHandler.js
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Sidebar.jsx
│       │   └── StatCard.jsx
│       ├── pages/
│       │   ├── Overview.jsx
│       │   ├── Sessions.jsx
│       │   ├── SessionDetail.jsx
│       │   └── Heatmap.jsx
│       └── lib/
│           └── api.js
├── tracker/
│   └── funnellens.js
└── demo/
    ├── index.html
    └── funnellens.js

8. Author
Udaybhan Pandey
B.Tech in Artificial Intelligence & Machine Learning, GGSIPU
