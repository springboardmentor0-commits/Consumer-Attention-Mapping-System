from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from sqlalchemy import func
from models import ShelfAnalytics
from datetime import datetime
from models import ShopperSession
from fastapi.responses import FileResponse


from database import engine, get_db
from models import Base, User, Role, Store, Shelf
from schemas import (
    UserRegister,
    UserLogin,
    StoreCreate,
    ShelfCreate
)
from auth import (
create_access_token,
get_current_user
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@app.get("/")
def home():
    return {"status": "running"}


@app.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        role_id=user.role_id
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message":"User created successfully"
    }
    

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email"
        )

    valid_password = pwd_context.verify(
        user.password,
        db_user.password_hash
    )

    if not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "email": db_user.email,
            "role_id": db_user.role_id
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@app.post("/stores")
def create_store(
    store: StoreCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_store = Store(
        store_name=store.store_name,
        location=store.location
    )

    db.add(new_store)
    db.commit()

    return {
        "message": "Store created"
    }


@app.get("/stores")
def get_stores(
    db: Session = Depends(get_db)
):

    stores = db.query(Store).all()

    return stores


@app.post("/shelves")
def create_shelf(
    shelf: ShelfCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_shelf = Shelf(
    store_id=shelf.store_id,
    shelf_name=shelf.shelf_name,
    zone_name=shelf.zone_name,
    zone_coordinates=shelf.zone_coordinates
)

    db.add(new_shelf)
    db.commit()

    return {
        "message":"Shelf created"
    }


@app.get("/shelves")
def get_shelves(
    db: Session = Depends(get_db)
):

    shelves = db.query(Shelf).all()

    return shelves

@app.get("/analytics/attention")
def get_attention_analytics(db: Session = Depends(get_db)):

    analytics = (
        db.query(
            ShelfAnalytics.shelf_name,
            func.sum(ShelfAnalytics.attention_time).label("total_attention")
        )
        .group_by(ShelfAnalytics.shelf_name)
        .all()
    )

    return [
        {
            "shelf_name": row.shelf_name,
            "total_attention": round(row.total_attention, 2)
        }
        for row in analytics
    ]

@app.get("/analytics/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):

    # Total unique shoppers
    total_shoppers = db.query(
        func.count(func.distinct(ShelfAnalytics.shopper_id))
    ).scalar()

    # Total attention time
    total_attention = db.query(
        func.sum(ShelfAnalytics.attention_time)
    ).scalar()

    # Average attention time
    average_attention = db.query(
        func.avg(ShelfAnalytics.attention_time)
    ).scalar()

    # Shelf with highest attention
    top_shelf = (
        db.query(
            ShelfAnalytics.shelf_name,
            func.sum(ShelfAnalytics.attention_time).label("attention")
        )
        .group_by(ShelfAnalytics.shelf_name)
        .order_by(func.sum(ShelfAnalytics.attention_time).desc())
        .first()
    )

    return {
        "total_shoppers": total_shoppers or 0,
        "total_attention": round(total_attention or 0, 2),
        "average_attention": round(average_attention or 0, 2),
        "top_shelf": top_shelf.shelf_name if top_shelf else "--"
    }
@app.get("/analytics/live")
def get_live_status():

    return {
        "active_shoppers": 3,
        "camera_status": "Online",
        "system_status": "Running",
        "last_update": datetime.now().strftime("%I:%M:%S %p")
    }

@app.get("/analytics/recommendations")
def get_recommendations(db: Session = Depends(get_db)):

    recommendations = (
        db.query(
            ShelfAnalytics.shelf_name,
            ShelfAnalytics.attractiveness_score,
            ShelfAnalytics.recommendation
        )
        .order_by(ShelfAnalytics.id.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "shelf": row.shelf_name,
            "score": row.attractiveness_score,
            "recommendation": row.recommendation
        }
        for row in recommendations
    ]

@app.get("/analytics/segments")
def get_segments(db: Session = Depends(get_db)):

    data = (
        db.query(
            ShopperSession.segment,
            func.count(ShopperSession.id).label("count")
        )
        .group_by(ShopperSession.segment)
        .all()
    )

    return [
        {
            "segment": row.segment,
            "count": row.count
        }
        for row in data
    ]

@app.get("/analytics/heatmap")
def get_heatmap():

    return FileResponse(
        "heatmap.png",
        media_type="image/png"
    )