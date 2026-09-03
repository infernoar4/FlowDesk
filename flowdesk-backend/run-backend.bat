@echo off
echo =========================================================
echo 🚀 Launching FlowDesk Java Spring Boot Enterprise Backend
echo =========================================================
cd /d %~dp0
call .\maven\bin\mvn.cmd spring-boot:run
pause
