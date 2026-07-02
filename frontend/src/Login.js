import { useState } from "react";
import axios from "axios";

function Login({setLoggedIn})  {

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const handleLogin = async() => {

        try{

            const response = await axios.post(
                "http://127.0.0.1:8000/login",
                {
                    email,
                    password
                }
            );

            const token = response.data.access_token;

            localStorage.setItem(
                "token",
                token
            );

            setLoggedIn(true);

        }

        catch(error){

            alert("Login Failed");

        }

    }

    return (

        <div className="card">

            <h2 style={{
textAlign:"center",
marginBottom:"20px",
color:"#443b64"
}}>
💫 Welcome Back
</h2>

                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e)=>setEmail(e.target.value)}/>

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e)=>setPassword(e.target.value)}/>

                <button
                    className="main-btn"
                    onClick={handleLogin}>
                        Login
                </button>

        </div>

    )
}



export default Login;

