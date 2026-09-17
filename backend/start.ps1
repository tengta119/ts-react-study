Write-Host "🚀 正在启动 TASK-004 FastAPI 本地后端服务..." -ForegroundColor Cyan
Write-Host "🔗 接口服务地址: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "📖 Swagger 交互文档: http://127.0.0.1:8000/docs" -ForegroundColor Yellow
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
