docker-compose up -d

go mod tidy
go run main.go

venv\Scripts\activate
start uvicorn vision_server:app --port 8000
python worker.py
