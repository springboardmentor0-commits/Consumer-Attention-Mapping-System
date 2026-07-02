import { useState } from "react";
import axios from "axios";

function Register(){

    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [roleId,setRoleId]=useState("");

    const handleRegister=async()=>{

        try{

            await axios.post(
                "http://127.0.0.1:8000/register",
                {
                    email,
                    password,
                    role_id:Number(roleId)
                }
            );

            alert("Registration Successful");

        }

        catch(error){

            alert("Registration Failed");

        }

    };

    return(

        <div className="card">

            <h2 style={{
textAlign:"center",
marginBottom:"20px",
color:"#443b64"
}}>
✨ Create Account
</h2>

            <input
            type="email"
            placeholder="Email"
            onChange={(e)=>setEmail(e.target.value)}
            />

            <input
            type="password"
            placeholder="Password"
            onChange={(e)=>setPassword(e.target.value)}
            />

            <select
            onChange={(e)=>setRoleId(e.target.value)}
            >

                <option value="">
                    Select Role
                </option>

                <option value="1">
                    Admin
                </option>

                <option value="2">
                    Store Manager
                </option>

                <option value="3">
                    Retail Analyst
                </option>

                <option value="4">
                    Marketing Manager
                </option>

            </select>

            <button
            className="main-btn"
            onClick={handleRegister}
            >
                Register
            </button>

        </div>

    );

}

export default Register;