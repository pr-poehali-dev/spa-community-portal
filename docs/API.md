# 📡 API Документация СПАРКОМ

## Базовая информация

- **Base URL:** `https://functions.poehali.dev`
- **Формат:** JSON
- **Авторизация:** Bearer Token через заголовок `Authorization`
- **CORS:** Настроен для всех origins

### Маппинг заголовков

⚠️ **ВАЖНО:** API Gateway автоматически маппит заголовки:
- `Authorization` → `X-Authorization` (в backend)
- `Cookie` → `X-Cookie` (в backend)
- `X-Set-Cookie` → `Set-Cookie` (в ответе)

Frontend отправляет стандартные заголовки, backend читает с префиксом `X-`.

---

## 🔐 Auth API

**Base URL:** `https://functions.poehali.dev/dc13fdd2-eb59-4658-8080-4ab0c13a84af`

### POST /login

Вход в систему.

**Request:**
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "token_here",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+79001234567",
    "first_name": "Иван",
    "last_name": "Иванов",
    "created_at": "2026-01-15T10:00:00"
  }
}
```

**Errors:**
- `400` - Некорректные данные
- `401` - Неверные credentials
- `429` - Превышен лимит попыток

---

### POST /register

Регистрация нового пользователя.

**Request:**
```json
{
  "action": "register",
  "email": "newuser@example.com",
  "password": "securepass123",
  "phone": "+79001234567",
  "first_name": "Пётр",
  "last_name": "Петров"
}
```

**Response (201):**
```json
{
  "access_token": "token_here",
  "refresh_token": "refresh_token_here",
  "expires_in": 3600,
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "phone": "+79001234567",
    "first_name": "Пётр",
    "last_name": "Петров",
    "created_at": "2026-01-15T10:00:00"
  }
}
```

**Errors:**
- `400` - Некорректные данные (короткий пароль, пустые поля)
- `409` - Email уже зарегистрирован
- `429` - Превышен лимит регистраций с IP

---

### POST /refresh

Обновление access токена.

**Request:**
```json
{
  "action": "refresh",
  "refresh_token": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "access_token": "new_access_token",
  "expires_in": 3600
}
```

**Errors:**
- `400` - Refresh token не передан
- `401` - Невалидный refresh token

---

### POST /logout

Выход из системы (отзыв токенов).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "action": "logout"
}
```

**Response (200):**
```json
{
  "message": "Вы вышли из системы"
}
```

**Errors:**
- `401` - Требуется авторизация
- `404` - Сессия не найдена

---

### POST /reset-password

Запрос на сброс пароля (отправка email).

**Request:**
```json
{
  "action": "reset-password",
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "Письмо с инструкциями отправлено"
}
```

**Note:** Всегда возвращает 200, даже если email не существует (защита от перебора).

---

### POST /confirm-reset

Подтверждение сброса пароля.

**Request:**
```json
{
  "action": "confirm-reset",
  "token": "reset_token_from_email",
  "new_password": "newsecurepass"
}
```

**Response (200):**
```json
{
  "message": "Пароль успешно изменён"
}
```

**Errors:**
- `400` - Невалидный или истёкший токен
- `400` - Пароль слишком короткий

---

## 👤 Users API

**Base URL:** `https://functions.poehali.dev/1808281e-46a4-4513-9ad6-18f885daa0b9`

### GET /me

Получение данных текущего пользователя.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+79001234567",
  "first_name": "Иван",
  "last_name": "Иванов",
  "created_at": "2026-01-15T10:00:00",
  "is_active": true,
  "reputation": {
    "score": 150,
    "reviews_count": 5
  },
  "roles": [
    {
      "role_type": "organizer",
      "level": 2,
      "status": "approved",
      "approved_at": "2026-01-10T12:00:00"
    }
  ]
}
```

---

### PUT /me

Обновление профиля.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "first_name": "Иван",
  "last_name": "Иванов",
  "phone": "+79009999999"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "phone": "+79009999999",
  "first_name": "Иван",
  "last_name": "Иванов",
  "created_at": "2026-01-15T10:00:00"
}
```

**Errors:**
- `400` - Имя и фамилия обязательны
- `401` - Требуется авторизация

---

### GET /{user_id}

Получение публичного профиля пользователя.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "id": 5,
  "first_name": "Пётр",
  "last_name": "Петров",
  "created_at": "2026-01-10T08:00:00",
  "reputation": {
    "score": 200,
    "reviews_count": 10
  },
  "roles": [
    {
      "role_type": "master",
      "level": 3
    }
  ]
}
```

**Errors:**
- `404` - Пользователь не найден

---

## 🎭 Roles API

**Base URL:** `https://functions.poehali.dev/477841f7-98e0-41e0-a0bd-465deaa56a14`

### POST /apply

Подача заявки на роль.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "role_type": "organizer",
  "description": "Имею опыт организации банных мероприятий более 3 лет. Провёл 15+ событий."
}
```

**Допустимые роли:**
- `organizer` - Организатор
- `master` - Мастер
- `partner` - Партнёр
- `editor` - Редактор

**Response (201):**
```json
{
  "id": 42,
  "role_type": "organizer",
  "status": "pending",
  "created_at": "2026-01-15T10:00:00"
}
```

**Errors:**
- `400` - Некорректная роль или описание < 20 символов
- `409` - У вас уже есть активная заявка или роль

---

### GET /my

Получение моих ролей.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
[
  {
    "role_type": "organizer",
    "level": 2,
    "status": "approved",
    "approved_at": "2026-01-10T12:00:00",
    "created_at": "2026-01-10T12:00:00"
  }
]
```

---

### GET /applications/my

Получение моих заявок на роли.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
[
  {
    "id": 42,
    "role_type": "organizer",
    "description": "Опыт организации...",
    "status": "pending",
    "created_at": "2026-01-15T10:00:00",
    "reviewed_at": null,
    "rejection_reason": null
  },
  {
    "id": 38,
    "role_type": "master",
    "description": "Опыт массажа...",
    "status": "rejected",
    "created_at": "2026-01-12T14:00:00",
    "reviewed_at": "2026-01-13T09:00:00",
    "rejection_reason": "Недостаточный опыт"
  }
]
```

---

## 🛡️ Admin API

**Base URL:** `https://functions.poehali.dev/b6fbba96-cc0b-4f59-b94d-e60ab18fe1b0`

**⚠️ Требуется роль:** `admin`

### GET /?resource=role_applications

Получение списка заявок на роли.

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Response (200):**
```json
[
  {
    "id": 42,
    "user": {
      "id": 10,
      "first_name": "Иван",
      "last_name": "Иванов",
      "email": "ivan@example.com"
    },
    "role_type": "organizer",
    "description": "Опыт организации...",
    "status": "pending",
    "created_at": "2026-01-15T10:00:00",
    "reviewed_at": null,
    "rejection_reason": null
  }
]
```

---

### PUT /?resource=role_application&id={id}

Одобрение или отклонение заявки.

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Request (одобрение):**
```json
{
  "status": "approved"
}
```

**Request (отклонение):**
```json
{
  "status": "rejected",
  "rejection_reason": "Недостаточный опыт работы"
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Errors:**
- `400` - Некорректный статус или заявка уже обработана
- `403` - Доступ запрещён (не админ)
- `404` - Заявка не найдена

---

### GET /?resource=users

Получение списка пользователей.

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Иван",
    "last_name": "Иванов",
    "created_at": "2026-01-10T08:00:00",
    "is_active": true,
    "roles_count": 2
  }
]
```

---

### GET /?resource=stats

Получение статистики.

**Headers:**
```
Authorization: Bearer {admin_access_token}
```

**Response (200):**
```json
{
  "active_users": 150,
  "pending_applications": 12,
  "approved_roles": 85,
  "total_events": 42,
  "total_bookings": 320
}
```

---

## 🔒 Rate Limiting

Все эндпоинты защищены от brute-force атак:

| Endpoint | Лимит | Окно | Блокировка |
|----------|-------|------|------------|
| `/auth/login` | 5 попыток | 15 мин | 15 мин |
| `/auth/register` | 3 попытки | 60 мин | 60 мин |
| `/auth/reset-password` | 3 попытки | 60 мин | 60 мин |

---

## 📝 Коды ответов

| Код | Описание |
|-----|----------|
| `200` | OK - Успешный запрос |
| `201` | Created - Ресурс создан |
| `400` | Bad Request - Некорректные данные |
| `401` | Unauthorized - Требуется авторизация |
| `403` | Forbidden - Доступ запрещён |
| `404` | Not Found - Ресурс не найден |
| `409` | Conflict - Конфликт (дубликат) |
| `429` | Too Many Requests - Превышен rate limit |
| `500` | Internal Server Error - Ошибка сервера |

---

## 🧪 Примеры использования

### JavaScript (Fetch API)

```javascript
// Вход
const login = async (email, password) => {
  const response = await fetch('https://functions.poehali.dev/dc13fdd2-eb59-4658-8080-4ab0c13a84af', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', email, password })
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  return data;
};

// Запрос с авторизацией
const getProfile = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('https://functions.poehali.dev/1808281e-46a4-4513-9ad6-18f885daa0b9/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Обновление токена
const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const response = await fetch('https://functions.poehali.dev/dc13fdd2-eb59-4658-8080-4ab0c13a84af', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'refresh', refresh_token: refresh })
  });
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  return data;
};
```

---

## 🚀 Следующие шаги

- [ ] Добавить WebSocket для real-time уведомлений
- [ ] Реализовать OAuth (Google, Yandex ID)
- [ ] Добавить 2FA
- [ ] Расширить админ API (логирование, блокировка пользователей)
