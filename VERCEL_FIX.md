# Исправление ошибки Vercel

## Проблема
```
Error: No Output Directory named "public" found after the Build completed.
```

## Решение

Vercel ищет папку `public` после сборки, но у нас статический сайт без сборки.

### Вариант 1: Настройки в Vercel Dashboard (рекомендуется)

1. Откройте проект в Vercel: https://vercel.com/dashboard
2. Settings → General
3. Framework Preset: выберите **"Other"** или **"Static HTML"**
4. Build Command: оставьте пустым или `echo 'No build needed'`
5. Output Directory: оставьте пустым (или `/`)
6. Install Command: оставьте пустым
7. Save

### Вариант 2: Создать папку public (альтернатива)

Если первый вариант не работает, можно переместить файлы в папку `public`:

```powershell
cd C:\Users\leviv\hatch_repo
mkdir public
Move-Item index.html public/
Move-Item styles.css public/
Move-Item app.js public/
Move-Item vercel.json public/
```

Но лучше использовать Вариант 1 - настройки в Dashboard.

## Текущая структура

```
hatch/
├── index.html
├── styles.css
├── app.js
├── vercel.json
├── package.json
└── ...
```

Это правильная структура для статического сайта. Просто нужно указать Vercel что это статический сайт без сборки.
