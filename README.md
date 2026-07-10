# Consumer Attention Mapping System — Milestone 1

**Milestone 1 (Week 1–2): Project Initialization, Design Process & Core Setup**

This delivers everything in the milestone's task list:
- Project architecture and database schema
- Backend + frontend environments
- JWT + OAuth2 authentication with role-based access control (RBAC)
- Store & shelf management workflows
- Camera feed registration + connectivity check ("integrate retail camera feeds")

Later milestones (2–4: detection/tracking, behavior intelligence, dashboards/deployment)
build on top of this scaffold — the architecture below already has the tables and
service boundaries they'll need.

---

## 1. Project layout

```
cams/
├── backend/                 FastAPI service (Python)
│   ├── app/
│   │   ├── core/            config.py, security.py (JWT/hashing)
│   │   ├── db/               database.py (SQLAlchemy engine/session)
│   │   ├── models/           User, Store, Zone, Shelf, Camera, Product
│   │   ├── schemas/          Pydantic request/response models
│   │   ├── api/routes/       auth, users, stores, cameras
│   │   └── main.py           FastAPI app entrypoint
│   ├── alembic/               DB migration scaffold
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 Next.js dashboard (JavaScript + Tailwind)
│   ├── pages/                login.js, dashboard.js, index.js, _app.js
│   ├── lib/api.js            Axios client with JWT attached
│   ├── Dockerfile
│   └── .env.local.example
├── docker-compose.yml         Postgres + Mongo + backend + frontend
└── docs/                      (put diagrams / wireframes here as you make them)
```

## 2. Database schema (PostgreSQL — primary DB)

| Table               | Purpose                                            |
|---------------------|-----------------------------------------------------|
| `users`              | Accounts, hashed password, `role` enum, OAuth flag |
| `stores`             | Store ID, name, location, layout description       |
| `zones`              | Named areas within a store (aisle, checkout, etc.) |
| `shelves`            | Shelf code, category, x/y position for heatmaps     |
| `cameras`            | Store/zone camera, stream URL, status, heartbeat    |
| `product_categories` | Product category lookup                            |
| `products`           | SKU, name, category, assigned shelf                 |

MongoDB is wired in (`MONGO_URI`) but unused until Milestone 2, where it will
store high-volume session/event/tracking data (dwell time, gaze events, etc.)
that doesn't fit a relational schema well.

**Roles implemented:** `administrator`, `store_manager`, `retail_analyst`,
`marketing_manager` — matching the roles table in the spec.

## 3. Prerequisites

Install these once, on your machine:
- **VS Code** with the *Python* and *ESLint* extensions (optional but helpful)
- **Docker Desktop** (runs Postgres, Mongo, backend, frontend together)
- **Python 3.11+** (only needed if you want to run the backend outside Docker)
- **Node.js 20+** (only needed if you want to run the frontend outside Docker)

## 4. Step-by-step setup (recommended: Docker, fastest path)

1. Open the `cams/` folder in VS Code: `File → Open Folder…`
2. Create your backend env file:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `.env` and set a strong `SECRET_KEY`. Leave the DB host as `localhost`
   for now — `docker-compose.yml` overrides it to `postgres` automatically
   for the containerized backend.
3. Create your frontend env file:
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   ```
4. From the project root, start everything:
   ```bash
   cd ..
   docker compose up --build
   ```
   This starts:
   - `postgres` on `localhost:5432`
   - `mongo` on `localhost:27017`
   - `backend` (FastAPI) on `localhost:8000`
   - `frontend` (Next.js) on `localhost:3000`
5. Open `http://localhost:8000/docs` — the auto-generated Swagger UI. This is
   the fastest way to test every endpoint without writing frontend code first.
6. Open `http://localhost:3000` — redirects to the login page.

### Create your first user and store (via Swagger UI at `/docs`)

1. `POST /api/v1/auth/register` — register an administrator:
   ```json
   {
     "full_name": "Admin User",
     "email": "admin@example.com",
     "password": "ChangeMe123!",
     "role": "administrator"
   }
   ```
2. `POST /api/v1/auth/login` (use the "Try it out" form fields `username`/`password`,
   this is the OAuth2 password flow) — copy the returned `access_token`.
3. Click **Authorize** at the top of the Swagger page and paste the token.
4. `POST /api/v1/stores` — create a store, e.g. `{"name": "Downtown Supermarket", "location": "123 Main St"}`.
5. `POST /api/v1/stores/zones` and `POST /api/v1/stores/shelves` — add zones/shelves to that store.
6. `POST /api/v1/cameras` — register a camera:
   ```json
   {
     "store_id": "<store id from step 4>",
     "name": "Aisle 3 Overhead Cam",
     "camera_type": "ip_cctv",
     "stream_url": "rtsp://your-camera-ip:554/stream1"
   }
   ```
7. `POST /api/v1/cameras/{camera_id}/check-connection` — verifies the stream
   opens with OpenCV and flips the camera's status to `online`/`error`.
8. Log in at `http://localhost:3000/login` with the admin account to see the
   dashboard shell listing the store you created.

## 5. Running without Docker (optional, native dev loop)

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # then edit SECRET_KEY etc.
```
Make sure Postgres is running locally (or point `.env` at a remote instance),
then start the API:
```bash
uvicorn app.main:app --reload
```
Visit `http://localhost:8000/docs`.

**Frontend:**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```
Visit `http://localhost:3000`.

## 6. VS Code tips for this repo

- Open the **Command Palette → Python: Select Interpreter** and pick the
  `.venv` you created in `backend/`, so imports (FastAPI, SQLAlchemy) resolve
  correctly and you get autocomplete.
- Install the **REST Client** or **Thunder Client** VS Code extension if you'd
  rather test endpoints from `.http` files than Swagger — happy to generate
  one if useful.
- Use the built-in terminal (`` Ctrl+` ``) split into two panes: one running
  `docker compose up`, another free for `git`, `alembic`, etc.

## 7. Generating a real database migration (instead of `create_all`)

`main.py` currently calls `Base.metadata.create_all()` on startup for
simplicity during early development. Once your schema stabilizes, switch to
Alembic:
```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```
Then remove the `create_all()` call from `app/main.py` so Alembic is the only
source of schema changes going forward.

## 8. What's already satisfied vs. what's next

**Done in this milestone:**
- ✅ Project objectives & architecture documented (this README + schema above)
- ✅ Database schema (Postgres tables above; Mongo wired for later)
- ✅ Frontend/backend environments (Docker Compose, `.env` templates)
- ✅ Auth: registration, JWT login/refresh, OAuth2 (Google) skeleton, RBAC via `require_roles(...)`
- ✅ Store & shelf/zone management CRUD
- ✅ Camera registration + connectivity check (OpenCV `VideoCapture`)

**Explicitly deferred to Milestone 2 (Consumer Detection & Attention Analysis):**
- Shopper detection/tracking engine (YOLOv8 + DeepSORT/ByteTrack)
- Gaze estimation / dwell time calculation
- Writing tracking events into MongoDB

Let me know when you're ready to move into Milestone 2 and I'll scaffold the
video ingestion + detection pipeline (Kafka/Redis streams, YOLOv8 inference
service, MongoDB event writes) on top of this foundation.
