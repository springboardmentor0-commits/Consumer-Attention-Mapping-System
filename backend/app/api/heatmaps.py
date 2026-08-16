from fastapi import APIRouter
from fastapi.responses import FileResponse
import os


router = APIRouter(
    prefix="/heatmaps",
    tags=["Heatmaps"],
)


@router.get("/store")
def get_store_heatmap():

    heatmap_path = os.path.join(
        "app",
        "static",
        "heatmaps",
        "store_heatmap.jpg"
    )

    if not os.path.exists(heatmap_path):
        return {
            "message": "Heatmap has not been generated yet."
        }

    return FileResponse(
        heatmap_path,
        media_type="image/jpeg"
    )