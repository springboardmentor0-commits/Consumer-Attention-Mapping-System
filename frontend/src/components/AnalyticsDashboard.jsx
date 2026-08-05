import { useEffect, useState } from "react";
import axios from "axios";
import StoreLayout from "./StoreLayout";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Card({title,value}){

return(

<div
style={{
background:"#ffffff",
padding:"22px",
borderRadius:"18px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)",
textAlign:"center",
transition:"0.3s"
}}
>
    

<h3
style={{
color:"#666",
marginBottom:"15px"
}}
>
{title}
</h3>

<h1
style={{
color:"#1A73E8",
margin:0,
fontWeight:"700"
}}
>
{value}
</h1>

</div>

);

}

function AnalyticsDashboard() {

    const [analytics, setAnalytics] = useState([]);
    const [summary, setSummary] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [segments, setSegments] = useState([]);

    useEffect(() => {

        fetchAnalytics();

        const interval = setInterval(() => {
            fetchAnalytics();
        }, 5000);

        return () => clearInterval(interval);

    }, []);

    const fetchAnalytics = async () => {

        try {

            const analyticsResponse = await axios.get(
    "http://127.0.0.1:8000/analytics/attention"
);

const summaryResponse = await axios.get(
    "http://127.0.0.1:8000/analytics/summary"
);

const recommendationResponse = await axios.get(
    "http://127.0.0.1:8000/analytics/recommendations"
);

const segmentResponse = await axios.get(
    "http://127.0.0.1:8000/analytics/segments"
);


setAnalytics(analyticsResponse.data);
setSummary(summaryResponse.data);
setRecommendations(recommendationResponse.data);
setSegments(segmentResponse.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    

    const data = {

        labels: analytics.map(item => item.shelf_name),

        datasets: [

            {

                label: "Attention Time (Seconds)",

                data: analytics.map(item => item.total_attention),

                backgroundColor: [

                    "#A7C7E7",
                    "#CDEAC0",
                    "#F7C8E0"

                ],

                borderRadius: 12

            }

        ]

    };

    const options = {

        responsive: true,

        plugins: {

            legend: {

                display: false

            },

            title: {

                display: true,

                text: "Consumer Shelf Attention Analytics"

            }

        }

    };

    if (analytics.length === 0) {

        return (

            <h2
                style={{
                    textAlign: "center",
                    marginTop: "80px"
                }}
            >
                Loading Analytics...
            </h2>

        );

    }
return (

<div
style={{
width:"1100px",
margin:"40px auto",
background:"#F6F8FC",
padding:"35px",
borderRadius:"25px",
boxShadow:"0 10px 35px rgba(0,0,0,.08)"
}}
>

<h1
style={{
textAlign:"center",
marginBottom:"10px",
color:"#1A73E8"
}}
>
🛒 Consumer Attention Analytics Dashboard
</h1>

<p
style={{
textAlign:"center",
color:"#666",
marginBottom:"40px"
}}
>
Real-Time Retail Shopper Analytics using YOLOv8 + ByteTrack + FastAPI + React
</p>
{/* KPI Cards */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"20px",
marginBottom:"35px"
}}
>

<Card
title="👥 Total Shoppers"
value={summary.total_shoppers}
/>

<Card
title="⏱ Avg Dwell"
value={`${summary.average_attention || 0} sec`}
/>

<Card
title="📊 Total Attention"
value={`${summary.total_attention || 0} sec`}
/>

<Card
title="🏆 Top Shelf"
value={summary.top_shelf}
/>

</div>
{/* Shelf Attention Chart */}

<Bar
data={data}
options={options}
height={120}
/>
<div
style={{
marginTop:"35px",
background:"#ffffff",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 8px 20px rgba(0,0,0,.08)"
}}
>

<h2
style={{
marginBottom:"20px",
color:"#1A73E8"
}}
>
🧠 Shopper Segments
</h2>

{
segments.map((item,index)=>(

<div
key={index}
style={{
display:"flex",
justifyContent:"space-between",
padding:"12px 0",
borderBottom:"1px solid #eee"
}}
>

<span
style={{
fontWeight:"600"
}}
>
{item.segment}
</span>

<span
style={{
color:"#1A73E8",
fontWeight:"700"
}}
>
{item.count}
</span>

</div>

))
}

</div>
<div
style={{
marginTop:"40px",
background:"#ffffff",
padding:"25px",
borderRadius:"20px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)"
}}
>

<h2
style={{
marginBottom:"20px",
color:"#333"
}}
>
🏆 Shelf Ranking
</h2>

<table
style={{
width:"100%",
borderCollapse:"collapse"
}}
>

<thead>

<tr
style={{
background:"#EEF4FF"
}}
>

<th style={{padding:"15px"}}>Rank</th>

<th style={{padding:"15px"}}>Shelf</th>

<th style={{padding:"15px"}}>Attention (sec)</th>

</tr>

</thead>

<tbody>

{
analytics
.sort((a,b)=>b.total_attention-a.total_attention)
.map((item,index)=>(

<tr
key={index}
style={{
textAlign:"center",
borderBottom:"1px solid #eee"
}}
>

<td style={{padding:"15px"}}>

{
index===0 ? "🥇" :
index===1 ? "🥈" :
index===2 ? "🥉" :
index+1
}

</td>

<td>{item.shelf_name}</td>

<td>{item.total_attention.toFixed(1)}</td>

</tr>

))
}

</tbody>

</table>
<StoreLayout analytics={analytics}/>
<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"20px",
marginTop:"35px"
}}
>

{
analytics.map((item,index)=>(

<div
key={index}
style={{
background:"#ffffff",
padding:"20px",
borderRadius:"18px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)"
}}
>

<h3>{item.shelf_name}</h3>

<h1
style={{
color:"#1A73E8"
}}
>
{item.total_attention.toFixed(1)} sec
</h1>

<progress
value={item.total_attention}
max={Math.max(...analytics.map(x=>x.total_attention))}
style={{
width:"100%",
height:"18px"
}}
/>

</div>

))
}

</div>

</div>
<div
style={{
marginTop:"40px",
background:"#ffffff",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)"
}}
>

<h2 style={{marginBottom:"20px"}}>
📢 Store Recommendations
</h2>

{
recommendations.map((item,index)=>(

<div
key={index}
style={{
padding:"15px",
marginBottom:"12px",
borderLeft:"6px solid #1A73E8",
background:"#F8F9FC",
borderRadius:"8px"
}}
>

<h3>{item.shelf_name}</h3>

<p>
⭐ Score : {item.attractiveness_score}
</p>

<p>
{item.recommendation}
</p>

</div>

))
}

</div>
<div
style={{
marginTop:"40px",
background:"#ffffff",
padding:"25px",
borderRadius:"18px",
boxShadow:"0 8px 25px rgba(0,0,0,.08)"
}}
>

<h2
style={{
marginBottom:"20px",
color:"#1A73E8"
}}
>
🔥 Store Traffic Heatmap
</h2>

<img
src={`http://127.0.0.1:8000/analytics/heatmap?${Date.now()}`}
alt="Heatmap"
style={{
width:"100%",
borderRadius:"15px"
}}
/>

</div>
<div
style={{
marginTop:"50px",
textAlign:"center",
color:"#999"
}}
>

Powered by

<strong>
 YOLOv8 • ByteTrack • FastAPI • React • PostgreSQL
</strong>

</div>

</div>

);
    

}

export default AnalyticsDashboard;