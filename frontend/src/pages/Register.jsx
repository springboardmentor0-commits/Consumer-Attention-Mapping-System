import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";

import api from "../services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import "./Register.css";

function Register() {
    const navigate = useNavigate();

    // ==========================================================
    // Component State
    // ==========================================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("2");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ==========================================================
    // Register Handler
    // ==========================================================

    const handleRegister = async (event) => {
        event.preventDefault();

        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register", {
                email,
                password,
                role_id: Number(roleId),
            });

            alert("Registration successful.");
            navigate("/");
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <Card className="register-card">

                <CardHeader className="register-header">

                    <CardTitle className="register-project-title">
                        Consumer Attention Mapping System
                    </CardTitle>

                    <CardDescription className="register-project-description">
                        A smart retail management platform for monitoring
                        stores, shelves and consumer attention analytics.
                    </CardDescription>

                    <div className="register-divider" />

                    <h2 className="register-title">
                        Create Account
                    </h2>

                    <p className="register-subtitle">
                        Enter your credentials to get started
                    </p>

                </CardHeader>

                <CardContent>

                    {error && (

                        <Alert
                            variant="destructive"
                            className="register-alert"
                        >

                            <AlertCircle className="h-4 w-4" />

                            <AlertTitle>
                                Error
                            </AlertTitle>

                            <AlertDescription>
                                {error}
                            </AlertDescription>

                        </Alert>

                    )}

                    <form
                        onSubmit={handleRegister}
                        className="register-form"
                    >

                        <div className="register-input-group">

                            <Label htmlFor="email">
                                Email Address
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                disabled={loading}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                            />

                        </div>

                        <div className="register-input-group">

                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                disabled={loading}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                        </div>

                        <div className="register-input-group">

                            <Label htmlFor="role">
                                Role
                            </Label>

                            <Select
                                value={roleId}
                                disabled={loading}
                                onValueChange={setRoleId}
                            >

                                <SelectTrigger>

                                    <SelectValue placeholder="Select Role" />

                                </SelectTrigger>

                                <SelectContent>

                                    <SelectItem value="1">
                                        Admin
                                    </SelectItem>

                                    <SelectItem value="2">
                                        Store Manager
                                    </SelectItem>

                                    <SelectItem value="3">
                                        Retail Analyst
                                    </SelectItem>

                                    <SelectItem value="4">
                                        Marketing Manager
                                    </SelectItem>

                                </SelectContent>

                            </Select>

                        </div>

                        <Button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Account"
                            )}

                        </Button>

                    </form>

                </CardContent>

                <CardFooter className="register-footer">

                    <p>

                        Already have an account?

                        <Link
                            to="/"
                            className="register-link"
                        >
                            Login
                        </Link>

                    </p>

                </CardFooter>

            </Card>

        </div>
    );
}

export default Register;