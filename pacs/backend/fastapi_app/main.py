from fastapi import FastAPI

app = FastAPI()

@app.get("/studies")
def get_studies():
    return {"message": "Elenco studi (mock)"}
