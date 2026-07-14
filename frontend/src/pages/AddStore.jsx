import { useState } from "react";
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

import "./AddStore.css";

export default function AddStore() {
    const navigate = useNavigate();

    const [storeName, setStoreName] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        const trimmedStoreName = storeName.trim();
        const trimmedLocation = location.trim();

        if (!trimmedStoreName) {
            setError("Please enter a store name.");
            return;
        }

        if (!trimmedLocation) {
            setError("Please enter a store location.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post("/layout/stores", {
                store_name: trimmedStoreName,
                location: trimmedLocation,
            });

            alert("Store added successfully!");

            navigate("/stores/view");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to save store."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="add-store-page">

            <div className="add-store-header">

                <div>
                    <h1 className="add-store-title">
                        Add Store
                    </h1>

                    <p className="add-store-subtitle">
                        Register a new retail store.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </Button>

            </div>

            <Card className="add-store-card">

                <CardHeader>

                    <CardTitle>
                        Store Information
                    </CardTitle>

                    <CardDescription>
                        Enter the details of the retail store.
                    </CardDescription>

                </CardHeader>

                <CardContent>

                    <form
                        className="add-store-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="add-store-field">

                            <Label>
                                Store Name
                            </Label>

                            <Input
                                value={storeName}
                                placeholder="Reliance Smart"
                                onChange={(e) =>
                                    setStoreName(e.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="add-store-field">

                            <Label>
                                Location
                            </Label>

                            <Input
                                value={location}
                                placeholder="Pune"
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                                required
                            />

                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">
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
                                    : "Save Store"}
                            </Button>

                        </CardFooter>

                    </form>

                </CardContent>

            </Card>

        </div>
    );
}