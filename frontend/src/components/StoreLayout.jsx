function StoreLayout({ analytics }) {

    const getColor = (attention) => {

        if (attention > 150)
            return "#ff4d4d";     // Red

        if (attention > 70)
            return "#ffd54f";     // Yellow

        return "#81c784";         // Green

    };

    return (

        <div
        style={{
            background:"#fff",
            padding:"30px",
            borderRadius:"20px",
            marginTop:"40px",
            boxShadow:"0 8px 25px rgba(0,0,0,.08)"
        }}
        >

        <h2>🏪 Store Layout</h2>

        <div
        style={{
            display:"flex",
            justifyContent:"space-between",
            marginTop:"25px",
            gap:"20px"
        }}
        >

        {

        analytics.map((shelf)=>(

        <div

        key={shelf.shelf_name}

        style={{

            flex:1,
            height:"180px",
            background:getColor(shelf.total_attention),
            borderRadius:"20px",

            display:"flex",
            justifyContent:"center",
            alignItems:"center",

            color:"#fff",
            fontSize:"26px",
            fontWeight:"bold"

        }}

        >

        {shelf.shelf_name}

        </div>

        ))

        }

        </div>

        </div>

    );

}

export default StoreLayout;