from fastapi import FastAPI


router = FastAPI()

@router.get("/get-all")
def get_all():
	return "This is an all lsit"