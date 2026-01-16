# Настройка API URL в Vercel

## Проблема: Статистика не отображается

Mini app не может получить статистику, потому что не знает адрес API сервера.

## Решение: Установить API_URL в Vercel

### Шаг 1: Получите URL вашего API на Railway

1. Откройте ваш проект в Railway
2. Откройте сервис с ботом
3. Вкладка **Settings** → **Networking**
4. Скопируйте URL (например: `https://your-app.railway.app`)
5. Добавьте `/api/stats` в конец: `https://your-app.railway.app/api/stats`

### Шаг 2: Установите переменную окружения в Vercel

1. Откройте проект в Vercel: https://vercel.com/dashboard
2. Найдите проект `hatch` (или ваш проект)
3. **Settings** → **Environment Variables**
4. Нажмите **Add New**
5. Заполните:
   - **Name**: `API_URL`
   - **Value**: `https://your-app.railway.app/api/stats` (ваш URL из Railway)
   - **Environment**: Все (Production, Preview, Development)
6. Нажмите **Save**

### Шаг 3: Перезапустите деплой

1. В Vercel откройте проект
2. Вкладка **Deployments**
3. Найдите последний деплой
4. Нажмите **...** (три точки) → **Redeploy**

Или просто сделайте новый commit и push - Vercel автоматически перезапустит деплой.

## Проверка

После перезапуска:
1. Откройте mini app
2. Откройте консоль браузера (F12)
3. Должны увидеть: `API URL: https://your-app.railway.app/api/stats`
4. Статистика должна загрузиться

## Альтернатива: Обновить напрямую в коде

Если не хотите использовать environment variables, можно обновить напрямую в `app.js`:

```javascript
const API_URL = 'https://your-app.railway.app/api/stats';
```

Но лучше использовать environment variables для гибкости.
