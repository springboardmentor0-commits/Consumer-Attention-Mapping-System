import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import "./ViewShelf.css";

export default function ViewShelves() {
    const navigate = useNavigate();

    const [shelves, setShelves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchShelves();
    }, []);

    async function fetchShelves() {
        try {
            setLoading(true);

            const response = await api.get("/layout/shelves");

            setShelves(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load shelves."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="view-shelves-page">

            <div className="view-shelves-header">

                <div>

                    <h1 className="view-shelves-title">
                        Shelf Management
                    </h1>

                    <p className="view-shelves-subtitle">
                        View all mapped shelves.
                    </p>

                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </Button>

            </div>

            <Card className="view-shelves-card">

                <CardHeader>

                    <CardTitle>
                        Shelf Records
                    </CardTitle>

                    <CardDescription>
                        All shelf mappings stored in PostgreSQL.
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    {loading && (
                        <div className="view-shelves-message">
                            Loading shelves...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="view-shelves-error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        shelves.length === 0 && (
                            <div className="view-shelves-message">
                                No shelves found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        shelves.length > 0 && (

                            <div className="table-wrapper">

                                <table className="view-shelves-table">

                                    <thead>

                                        <tr>
                                            <th>ID</th>
                                            <th>Store ID</th>
                                            <th>Shelf Name</th>
                                            <th>Zone Coordinates</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {shelves.map((shelf) => (

                                            <tr key={shelf.id}>

                                                <td>{shelf.id}</td>
                                                <td>{shelf.store_id}</td>
                                                <td>{shelf.shelf_name}</td>
                                                <td>{shelf.zone_coordinates}</td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                </CardContent>

            </Card>

        </div>
    );
}