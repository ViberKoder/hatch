# Скрипт для развертывания на GitHub Pages
# Запустите после создания репозитория на GitHub

Write-Host "Проверка статуса git..." -ForegroundColor Cyan
git status

Write-Host "`nПопытка push на GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Успешно загружено на GitHub!" -ForegroundColor Green
    Write-Host "`nСледующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Перейдите на https://github.com/tohatchbot/hatch/settings/pages" -ForegroundColor White
    Write-Host "2. Включите GitHub Pages:" -ForegroundColor White
    Write-Host "   - Source: Deploy from a branch" -ForegroundColor White
    Write-Host "   - Branch: main, folder: / (root)" -ForegroundColor White
    Write-Host "   - Нажмите Save" -ForegroundColor White
    Write-Host "`n3. Mini app будет доступна через несколько минут по адресу:" -ForegroundColor White
    Write-Host "   https://tohatchbot.github.io/hatch/" -ForegroundColor Green
} else {
    Write-Host "`n❌ Ошибка при push. Убедитесь что:" -ForegroundColor Red
    Write-Host "   1. Репозиторий создан на GitHub: https://github.com/tohatchbot/hatch" -ForegroundColor White
    Write-Host "   2. У вас есть доступ к репозиторию" -ForegroundColor White
    Write-Host "   3. Вы авторизованы в git (git config --global user.name и user.email)" -ForegroundColor White
}
