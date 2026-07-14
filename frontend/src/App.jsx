import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import AddStore from "./pages/AddStore";
import ViewStore from "./pages/ViewStore";

import AddShelf from "./pages/AddShelf";
import ViewShelf from "./pages/ViewShelf";

function App() {
    return (
        <Routes>

            {/* Authentication */}
            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* Dashboard */}
            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            {/* Store */}
            <Route
                path="/stores/add"
                element={<AddStore />}
            />

            <Route
                path="/stores/view"
                element={<ViewStore />}
            />

            {/* Shelf */}
            <Route
                path="/shelves/add"
                element={<AddShelf />}
            />

            <Route
                path="/shelves/view"
                element={<ViewShelf />}
            />

        </Routes>
    );
}

export default App;