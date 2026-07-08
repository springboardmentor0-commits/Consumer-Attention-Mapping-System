# Consumer Attention Mapping System

## Project Summary

This is a full-stack web application designed to map and analyze consumer attention. It follows a modern client-server architecture, with a distinct frontend and backend communicating via APIs.

### Technology Stack

**1. Backend (Python)**
*   **Language/Framework:** The backend is built using **Python**.
*   **Database:** The application is connected to a **Microsoft SQL Server** database.
*   **Database Interaction (ORM):** It uses **SQLAlchemy** as the Object-Relational Mapper (ORM) for all database communications.
*   **Database Driver:** It uses **`pyodbc`** for synchronous and **`aioodbc`** for asynchronous database operations, providing a robust and high-performance connection to SQL Server.

**2. Frontend (JavaScript/TypeScript)**
*   **Language/Environment:** The frontend is a modern JavaScript/TypeScript application running on **Node.js**.
*   **Code Quality & Maintainability:** The project uses **ESLint** along with plugins like `eslint-plugin-import` and `@rushstack/eslint-patch` to enforce high code quality, consistency, and maintainable module imports.
*   **Module Resolution:** It leverages **`enhanced-resolve`** (likely via a bundler like Webpack) for advanced and flexible module path resolution, which is essential for complex projects with path aliases.

---

## Project Structure

The project is organized into two main directories: `frontend` and `backend`, representing a clear separation of concerns between the client-side and server-side applications.

```
.
├── backend/                  # Python Backend (Server-side)
│   ├── venv/                 # Virtual environment for Python dependencies
│   ├── app.py                # Main application file (example)
│   └── requirements.txt      # List of Python dependencies
│
├── frontend/                 # JavaScript/TypeScript Frontend (Client-side)
│   ├── node_modules/         # Node.js dependencies
│   ├── public/               # Static assets
│   ├── src/                  # Frontend source code
│   └── package.json          # Project metadata and npm dependencies
│
└── README.md                 # This file
```

## Project Flow

1.  **User Interaction:** A user accesses the system through a web browser, interacting with the **JavaScript/TypeScript frontend**.
2.  **API Communication:** The frontend sends HTTP requests (e.g., to fetch data or submit a form) to the **Python backend API**.
3.  **Backend Processing:** The Python backend receives the request and processes the business logic.
4.  **Database Operation:** The backend uses **SQLAlchemy** to construct and execute queries against the **Microsoft SQL Server** database via the `pyodbc` driver.
5.  **Response:** The backend sends the data back to the frontend (typically as JSON), which then updates the user interface.

---

## How to Run This Project

### Prerequisites

*   Python 3.8+
*   Node.js and npm (or an equivalent package manager like Yarn)
*   Access to a running Microsoft SQL Server instance
*   ODBC Driver for SQL Server installed on the machine running the backend.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```sh
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```sh
    python -m venv venv
    .\venv\Scripts\activate  # On Windows
    # source venv/bin/activate  # On macOS/Linux
    ```
3.  **Install Python dependencies:**
    ```sh
    pip install -r requirements.txt
    ```
4.  **Configure Database Connection:**
    *   Update the database connection string in the application's configuration file to point to your SQL Server instance with the correct credentials.
5.  **Run the backend server:**
    ```sh
    python app.py  # Or your main application file
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd frontend
    ```
2.  **Install Node.js dependencies:**
    ```sh
    npm install
    ```
3.  **Run the frontend development server:**
    ```sh
    npm start
    ```

After completing these steps, the application should be accessible in your web browser, typically at `http://localhost:3000`.