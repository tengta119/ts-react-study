@echo off
chcp 65001 >nul
echo 正在启动 TASK-004 FastAPI 本地后端服务...
echo 接口地址: http://127.0.0.1:8000
echo 在线文档: http://127.0.0.1:8000/docs
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
