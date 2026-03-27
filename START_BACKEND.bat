@echo off
echo ============================================
echo   Hospital Portal - Backend Server
echo ============================================
echo.
cd "c:\Users\Sam Aluri\Downloads\Hospital Portal\microservices\auth-service\AuthService"
echo Starting backend server...
echo Backend will be at: http://localhost:5073
echo Swagger UI at: http://localhost:5073/swagger
echo.
dotnet run
