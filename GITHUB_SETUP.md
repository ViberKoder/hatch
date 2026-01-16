# Инструкция по созданию репозитория на GitHub

Репозиторий еще не создан. Выполните следующие шаги:

## Вариант 1: Через веб-интерфейс GitHub

1. Перейдите на https://github.com/new
2. Repository name: `hatch`
3. Owner: `tohatchbot`
4. Выберите Public
5. НЕ добавляйте README, .gitignore или license (они уже есть)
6. Нажмите "Create repository"

После создания выполните:
```bash
cd C:\Users\leviv\hatch_miniapp
git push -u origin main
```

## Вариант 2: Через GitHub CLI

Если у вас установлен GitHub CLI:
```bash
gh repo create tohatchbot/hatch --public --source=. --remote=origin --push
```

## После создания репозитория

1. Включите GitHub Pages:
   - Перейдите в Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Нажмите Save

2. Mini app будет доступна по адресу: https://tohatchbot.github.io/hatch/

## Текущий статус

✅ Локальный репозиторий создан
✅ Все файлы закоммичены
⏳ Ожидается создание репозитория на GitHub
⏳ Ожидается push на GitHub
⏳ Ожидается настройка GitHub Pages
