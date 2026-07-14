import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import "./AddShelf.css";

export default function AddShelf() {
    const navigate = useNavigate();

    const [stores, setStores] = useState([]);

    const [storeId, setStoreId] = useState("");
    const [shelfName, setShelfName] = useState("");
    const [zoneCoordinates, setZoneCoordinates] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStores();
    }, []);

    async function fetchStores() {
        try {
            const response = await api.get("/layout/stores");

            setStores(response.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load stores.");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmedShelfName = shelfName.trim();
        const trimmedCoordinates = zoneCoordinates.trim();

        if (!storeId) {
            setError("Please select a store.");
            return;
        }

        if (!trimmedShelfName) {
            setError("Please enter a shelf name.");
            return;
        }

        if (!trimmedCoordinates) {
            setError("Please enter zone coordinates.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post("/layout/shelves", {
                store_id: Number(storeId),
                shelf_name: trimmedShelfName,
                zone_coordinates: trimmedCoordinates,
            });

            alert("Shelf added successfully!");

            navigate("/shelves/view");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to save shelf."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="add-shelf-page">
            <div className="add-shelf-header">
                <div>
                    <h1 className="add-shelf-title">
                        Add Shelf
                    </h1>

                    <p className="add-shelf-subtitle">
                        Assign a shelf to a registered store.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </Button>
            </div>

            <Card className="add-shelf-card">
                <CardHeader>
                    <CardTitle>
                        Shelf Information
                    </CardTitle>

                    <CardDescription>
                        Enter shelf details.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        className="add-shelf-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="add-shelf-field">
                            <Label>Store</Label>

                            <Select
                                value={storeId}
                                onValueChange={setStoreId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Store" />
                                </SelectTrigger>

                                <SelectContent>
                                    {stores.map((store) => (
                                        <SelectItem
                                            key={store.id}
                                            value={String(store.id)}
                                        >
                                            {store.store_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="add-shelf-field">
                            <Label>Shelf Name</Label>

                            <Input
                                value={shelfName}
                                placeholder="Electronics Shelf"
                                required
                                onChange={(e) =>
                                    setShelfName(e.target.value)
                                }
                            />
                        </div>

                        <div className="add-shelf-field">
                            <Label>Zone Coordinates</Label>

                            <Input
                                value={zoneCoordinates}
                                placeholder="(100,200)"
                                required
                                onChange={(e) =>
                                    setZoneCoordinates(e.target.value)
                                }
                            />
                        </div>

                        {error && (
                            <p style={{ color: "red" }}>
                                {error}
                            </p>
                        )}

                        <CardFooter className="px-0">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : "Save Shelf"}
                            </Button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}