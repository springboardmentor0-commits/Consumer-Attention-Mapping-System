import {useState} from "react";

import "./styles.css";

import Login from "./Login";
import Register from "./Register";
import AddStore from "./AddStore";
import AddShelf from "./AddShelf";
import AnalyticsDashboard from "./components/AnalyticsDashboard";


function App(){

const [loggedIn,setLoggedIn]=useState(false);

const [activeTab,setActiveTab]=useState("login");

const token=localStorage.getItem("token");

if(token && !loggedIn){
setLoggedIn(true);
}

return(

<>

{!loggedIn ? (

<div className="container">

<div className="card">

<h1>
Consumer Attention System
</h1>

<p className="auth-subtitle">

Welcome ✨ Please login or create an account

</p>

<div className="tabs">

<button
className="tab-btn"
onClick={()=>setActiveTab("login")}
>

Login

</button>


<button
className="tab-btn"
onClick={()=>setActiveTab("register")}
>

Register

</button>

</div>

{activeTab==="login" ?

<Login setLoggedIn={setLoggedIn}/>

:

<Register/>

}

</div>

</div>

)

:

(

<div className="dashboard">

<button
className="logout"
onClick={()=>{

localStorage.removeItem("token");

window.location.reload();

}}
>

↩ Logout

</button>

<h1 className="dashboard-title">

Store Dashboard

</h1>

<p className="dashboard-subtitle">

Manage stores and shelf zones

</p>

<div className="forms">

<div className="form-card">

<AddStore/>

</div>


<div className="form-card">

<AddShelf/>

</div>

<div >
    <AnalyticsDashboard/>
</div>

</div>

</div>

)}

</>

)

}

export default App;