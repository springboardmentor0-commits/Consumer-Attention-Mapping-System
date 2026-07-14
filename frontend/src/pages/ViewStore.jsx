import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import { Button } from "@/components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import "./ViewStore.css";

export default function ViewStore() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStores();
    }, []);

    async function fetchStores() {
        try {
            setLoading(true);

            const response = await api.get("/layout/stores");

            setStores(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to load stores."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="view-store-page">

            <div className="view-store-header">

                <div>
                    <h1 className="view-store-title">
                        Store Management
                    </h1>

                    <p className="view-store-subtitle">
                        View all registered retail stores.
                    </p>
                </div>

                <div className="view-store-actions">

                    <Button
                        onClick={() => navigate("/stores/add")}
                    >
                        Add Store
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </Button>

                </div>

            </div>

            <Card className="view-store-card">

                <CardHeader>

                    <CardTitle>
                        Store Records
                    </CardTitle>

                    <CardDescription>
                        All stores currently registered in PostgreSQL.
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    {loading && (
                        <div className="view-store-message">
                            Loading stores...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="view-store-error">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        stores.length === 0 && (
                            <div className="view-store-message">
                                No stores found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        stores.length > 0 && (

                            <Table>

                                <TableHeader>

                                    <TableRow>

                                        <TableHead>ID</TableHead>
                                        <TableHead>Store Name</TableHead>
                                        <TableHead>Location</TableHead>

                                    </TableRow>

                                </TableHeader>

                                <TableBody>

                                    {stores.map((store) => (

                                        <TableRow key={store.id}>

                                            <TableCell>
                                                {store.id}
                                            </TableCell>

                                            <TableCell>
                                                {store.store_name}
                                            </TableCell>

                                            <TableCell>
                                                {store.location}
                                            </TableCell>

                                        </TableRow>

                                    ))}

                                </TableBody>

                            </Table>

                        )}

                </CardContent>

            </Card>

        </div>
    );
}