"""Documents API routes - Stub"""
from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """Upload document"""
    return {"document_id": "doc_123", "filename": file.filename}
