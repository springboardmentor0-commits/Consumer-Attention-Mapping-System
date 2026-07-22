from database import SessionLocal
from models import Shelf

def load_shelves():

    db = SessionLocal()

    shelves = db.query(Shelf).all()

    db.close()

    shelf_data = []

    for shelf in shelves:

        if shelf.zone_coordinates:

            try:
                x1, y1, x2, y2 = map(
                int,
                shelf.zone_coordinates.split(","))
            except:
                continue

            shelf_data.append({

                "id": shelf.id,

                "name": shelf.shelf_name,

                "zone": shelf.zone_name,

                "coords": (x1, y1, x2, y2)

            })

    return shelf_data