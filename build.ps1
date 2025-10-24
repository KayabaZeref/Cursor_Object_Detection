# Set Java 17 for this session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Java Version Check:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
& java -version

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Stopping Gradle Daemons..." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Set-Location android
& .\gradlew --stop

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Cleaning Build..." -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
& .\gradlew clean

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Building APK..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
& .\gradlew app:assembleDebug

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Set-Location ..

Read-Host -Prompt "Press Enter to exit"


