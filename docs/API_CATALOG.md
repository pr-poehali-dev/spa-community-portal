# 🏛️ Catalog, Events, Bookings & Reviews API

Документация для работы с каталогом бань, мастеров, мероприятий, бронированиями и отзывами.

---

## 🛁 Catalog API

**Base URL:** `https://functions.poehali.dev/7e573a30-cdfd-4b7f-9205-0cfc86ca8954`

### GET /?resource=baths

Получение списка бань с фильтрацией и сортировкой.

**Query Parameters:**
- `resource` (required): `baths`
- `city` (optional): Фильтр по городу (поиск в адресе)
- `min_capacity` (optional): Минимальная вместимость
- `max_price` (optional): Максимальная цена за час
- `min_rating` (optional): Минимальный рейтинг
- `search` (optional): Поиск по названию и описанию
- `sort` (optional): 
  - `rating` (по умолчанию) - по рейтингу
  - `price_asc` - по цене возрастание
  - `price_desc` - по цене убывание
  - `reviews` - по количеству отзывов
- `limit` (optional): Количество результатов (по умолчанию 20, макс 100)
- `offset` (optional): Смещение для пагинации

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "slug": "banya-na-presne",
      "name": "Баня на Пресне",
      "address": "Москва, ул. Красная Пресня, 15",
      "capacity": 10,
      "price_per_hour": 3000,
      "features": ["Дровяная печь", "Купель с холодной водой"],
      "images": ["https://cdn.poehali.dev/..."],
      "rating": 4.8,
      "reviews_count": 127
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

---

### GET /?resource=baths&slug={slug}

Получение детальной информации о бане по slug.

**Response (200):**
```json
{
  "id": 1,
  "slug": "banya-na-presne",
  "name": "Баня на Пресне",
  "address": "Москва, ул. Красная Пресня, 15",
  "description": "Традиционная русская баня с вековой историей в центре Москвы",
  "capacity": 10,
  "price_per_hour": 3000,
  "features": ["Дровяная печь", "Купель с холодной водой", "Комната отдыха"],
  "images": ["https://cdn.poehali.dev/..."],
  "rating": 4.8,
  "reviews_count": 127,
  "created_at": "2026-01-12T08:59:41.857232"
}
```

**Errors:**
- `404` - Баня не найдена

---

### GET /?resource=baths&id={id}

Получение детальной информации о бане по ID.

**Response:** Аналогично slug запросу

---

### GET /?resource=masters

Получение списка мастеров с фильтрацией и сортировкой.

**Query Parameters:**
- `resource` (required): `masters`
- `specialization` (optional): Фильтр по специализации
- `min_experience` (optional): Минимальный опыт работы (годы)
- `min_rating` (optional): Минимальный рейтинг
- `search` (optional): Поиск по имени, описанию, специализации
- `sort` (optional):
  - `rating` (по умолчанию) - по рейтингу
  - `experience` - по опыту
  - `reviews` - по количеству отзывов
- `limit` (optional): Количество результатов (по умолчанию 20, макс 100)
- `offset` (optional): Смещение для пагинации

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "slug": "ivan-parmaster",
      "name": "Иван Петров",
      "specialization": "Традиционное парение",
      "experience": 15,
      "avatar_url": "https://cdn.poehali.dev/...",
      "rating": 4.9,
      "reviews_count": 89
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

---

### GET /?resource=masters&slug={slug}

Получение детальной информации о мастере по slug.

**Response (200):**
```json
{
  "id": 1,
  "slug": "ivan-parmaster",
  "name": "Иван Петров",
  "specialization": "Традиционное парение",
  "experience": 15,
  "description": "Профессиональный пармастер с 15-летним стажем...",
  "avatar_url": "https://cdn.poehali.dev/...",
  "services": [
    {
      "name": "Классическое парение",
      "price": 2000,
      "duration": 60
    },
    {
      "name": "Парение с массажем",
      "price": 3500,
      "duration": 90
    }
  ],
  "rating": 4.9,
  "reviews_count": 89,
  "created_at": "2026-01-12T08:59:41.875356"
}
```

**Errors:**
- `404` - Мастер не найден

---

### GET /?resource=masters&id={id}

Получение детальной информации о мастере по ID.

**Response:** Аналогично slug запросу

---

## 🎉 Events API

**Base URL:** `https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8`

### GET /

Получение списка мероприятий с фильтрацией и сортировкой.

**Query Parameters:**
- `type` (optional): Фильтр по типу события - `men`, `women`, `mixed`
- `search` (optional): Поиск по названию и описанию
- `date_from` (optional): Фильтр - события начиная с даты (формат: YYYY-MM-DD)
- `date_to` (optional): Фильтр - события до даты (формат: YYYY-MM-DD)
- `available_only` (optional): Только события со свободными местами (`true`/`false`)
- `sort` (optional):
  - `date` (по умолчанию) - по дате и времени
  - `price_asc` - по цене возрастание
  - `price_desc` - по цене убывание
  - `spots` - по количеству свободных мест
- `limit` (optional): Количество результатов (по умолчанию 20, макс 100)
- `offset` (optional): Смещение для пагинации

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "slug": "tradicionnyy-muzhskoy-par",
      "title": "Традиционный мужской парной день",
      "description": "Погружение в атмосферу традиционной русской бани...",
      "date": "2026-01-18",
      "time": "14:00:00",
      "location": "Баня на Пресне",
      "type": "men",
      "price": 1500,
      "available_spots": 8,
      "total_spots": 10,
      "image_url": "https://cdn.poehali.dev/..."
    }
  ],
  "total": 4,
  "limit": 20,
  "offset": 0
}
```

---

### GET /?slug={slug}

Получение детальной информации о событии по slug.

**Response (200):**
```json
{
  "id": 1,
  "slug": "tradicionnyy-muzhskoy-par",
  "title": "Традиционный мужской парной день",
  "description": "Погружение в атмосферу традиционной русской бани...",
  "date": "2026-01-18",
  "time": "14:00:00",
  "location": "Баня на Пресне",
  "type": "men",
  "price": 1500,
  "available_spots": 8,
  "total_spots": 10,
  "image_url": "https://cdn.poehali.dev/...",
  "program": [
    "Знакомство и чайная церемония",
    "Первый мягкий заход",
    "Парение с дубовым веником",
    "Отдых и общение"
  ],
  "rules": [
    "Записаться не позднее чем за 24 часа",
    "Принести свой халат и тапочки",
    "Сообщить о противопоказаниях"
  ],
  "created_at": "2026-01-12T08:59:41.823814"
}
```

**Errors:**
- `404` - Событие не найдено

---

### GET /?id={id}

Получение детальной информации о событии по ID.

**Response:** Аналогично slug запросу

---

### POST /

Регистрация на событие (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "event_id": 1
}
```

**Response (201):**
```json
{
  "id": 15,
  "registered_at": "2026-01-16T10:00:00",
  "message": "Регистрация успешна"
}
```

**Errors:**
- `400` - Нет свободных мест или некорректные данные
- `401` - Требуется авторизация
- `404` - Событие не найдено
- `409` - Вы уже зарегистрированы на это событие

---

### DELETE /?event_id={id}

Отмена регистрации на событие (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Регистрация отменена"
}
```

**Errors:**
- `400` - Регистрация уже отменена
- `401` - Требуется авторизация
- `404` - Регистрация не найдена

---

### GET /?my_registrations=true

Получение списка регистраций текущего пользователя (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "registrations": [
    {
      "id": 15,
      "event_id": 1,
      "status": "registered",
      "registered_at": "2026-01-16T10:00:00",
      "canceled_at": null,
      "event": {
        "slug": "tradicionnyy-muzhskoy-par",
        "title": "Традиционный мужской парной день",
        "date": "2026-01-18",
        "time": "14:00:00",
        "location": "Баня на Пресне",
        "price": 1500,
        "image_url": "https://cdn.poehali.dev/..."
      }
    }
  ]
}
```

**Errors:**
- `401` - Требуется авторизация

---

## 📅 Bookings API

**Base URL:** `https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f`

### GET /

Получение списка бронирований текущего пользователя (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `id` (optional): Получить конкретное бронирование по ID
- `status` (optional): Фильтр по статусу - `pending`, `confirmed`, `completed`, `canceled`
- `type` (optional): Фильтр по типу - `bath`, `master`
- `date_from` (optional): Фильтр - бронирования начиная с даты (формат: YYYY-MM-DD)
- `date_to` (optional): Фильтр - бронирования до даты (формат: YYYY-MM-DD)
- `limit` (optional): Количество результатов (по умолчанию 20, макс 100)
- `offset` (optional): Смещение для пагинации

**Response (200) - список:**
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 5,
      "booking_type": "bath",
      "entity_id": 1,
      "entity_name": "Баня на Пресне",
      "entity_info": "Москва, ул. Красная Пресня, 15",
      "booking_date": "2026-01-20",
      "start_time": "14:00:00",
      "end_time": "17:00:00",
      "guests_count": 6,
      "total_price": 9000,
      "status": "confirmed",
      "notes": "Нужны веники",
      "created_at": "2026-01-16T10:00:00"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

**Response (200) - одно бронирование:**
```json
{
  "id": 1,
  "user_id": 5,
  "booking_type": "bath",
  "entity_id": 1,
  "entity_name": "Баня на Пресне",
  "entity_address": "Москва, ул. Красная Пресня, 15",
  "booking_date": "2026-01-20",
  "start_time": "14:00:00",
  "end_time": "17:00:00",
  "guests_count": 6,
  "total_price": 9000,
  "status": "confirmed",
  "notes": "Нужны веники",
  "canceled_at": null,
  "cancellation_reason": null,
  "created_at": "2026-01-16T10:00:00",
  "updated_at": "2026-01-16T10:00:00"
}
```

**Errors:**
- `401` - Требуется авторизация
- `404` - Бронирование не найдено (при запросе по ID)

---

### POST /

Создание нового бронирования (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "booking_type": "bath",
  "entity_id": 1,
  "booking_date": "2026-01-20",
  "start_time": "14:00",
  "end_time": "17:00",
  "guests_count": 6,
  "notes": "Нужны веники"
}
```

**Validation:**
- `booking_type`: должен быть `bath` или `master`
- `entity_id`: ID бани или мастера (должен существовать)
- `booking_date`: дата в будущем (формат: YYYY-MM-DD)
- `start_time`, `end_time`: время (формат: HH:MM), end_time > start_time
- `guests_count`: положительное число (по умолчанию 1)

**Response (201):**
```json
{
  "id": 1,
  "total_price": 9000,
  "created_at": "2026-01-16T10:00:00",
  "message": "Бронирование успешно создано"
}
```

**Errors:**
- `400` - Некорректные данные, выбранный слот занят, дата в прошлом, или время некорректно
- `401` - Требуется авторизация
- `404` - Баня или мастер не найдены

---

### PUT /

Обновление статуса бронирования (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "booking_id": 1,
  "status": "confirmed"
}
```

**Validation:**
- `status`: должен быть `pending`, `confirmed` или `completed`
- Нельзя изменить отмененное бронирование

**Response (200):**
```json
{
  "message": "Статус бронирования обновлен"
}
```

**Errors:**
- `400` - Некорректный статус или попытка изменить отмененное бронирование
- `401` - Требуется авторизация
- `404` - Бронирование не найдено

---

### DELETE /?booking_id={id}

Отмена бронирования (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request (optional body):**
```json
{
  "reason": "Изменились планы"
}
```

**Response (200):**
```json
{
  "message": "Бронирование отменено"
}
```

**Errors:**
- `400` - Бронирование уже отменено или отсутствует booking_id
- `401` - Требуется авторизация
- `404` - Бронирование не найдено

---

## ⭐ Reviews API

**Base URL:** `https://functions.poehali.dev/6d9be798-b393-4f38-941a-9a2025d8ca11`

### GET /?entity_type={type}&entity_id={id}

Получение отзывов для сущности.

**Query Parameters:**
- `entity_type` (required): Тип сущности - `bath`, `master`, `event`
- `entity_id` (required): ID сущности

**Response (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Отличная баня! Очень понравилось...",
      "response": "Спасибо за отзыв!",
      "created_at": "2026-01-15T10:00:00",
      "user": {
        "id": 5,
        "first_name": "Иван",
        "last_name": "Петров"
      }
    }
  ],
  "stats": {
    "average_rating": 4.8,
    "total_count": 127
  }
}
```

**Errors:**
- `400` - Некорректный тип сущности или отсутствуют параметры
- `404` - Сущность не найдена

---

### POST /

Создание нового отзыва (требуется авторизация).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "entity_type": "bath",
  "entity_id": 1,
  "rating": 5,
  "comment": "Отличная баня! Очень понравилось парение и купель."
}
```

**Validation:**
- `entity_type`: должен быть `bath`, `master` или `event`
- `rating`: от 1 до 5
- `comment`: минимум 10 символов

**Response (201):**
```json
{
  "id": 42,
  "created_at": "2026-01-16T10:00:00",
  "message": "Отзыв успешно создан"
}
```

**Errors:**
- `400` - Некорректные данные
- `401` - Требуется авторизация
- `409` - Вы уже оставляли отзыв на эту сущность

---

## 🧪 Примеры использования

### JavaScript (Fetch API)

```javascript
// Получение списка бань в Москве с фильтрами
const getBaths = async () => {
  const params = new URLSearchParams({
    resource: 'baths',
    city: 'Москва',
    min_capacity: 8,
    sort: 'rating'
  });
  
  const response = await fetch(`https://functions.poehali.dev/7e573a30-cdfd-4b7f-9205-0cfc86ca8954/?${params}`);
  return response.json();
};

// Получение детальной информации о бане
const getBath = async (slug) => {
  const params = new URLSearchParams({
    resource: 'baths',
    slug: slug
  });
  
  const response = await fetch(`https://functions.poehali.dev/7e573a30-cdfd-4b7f-9205-0cfc86ca8954/?${params}`);
  return response.json();
};

// Получение отзывов о бане
const getReviews = async (bathId) => {
  const params = new URLSearchParams({
    entity_type: 'bath',
    entity_id: bathId
  });
  
  const response = await fetch(`https://functions.poehali.dev/6d9be798-b393-4f38-941a-9a2025d8ca11/?${params}`);
  return response.json();
};

// Создание отзыва
const createReview = async (bathId, rating, comment) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('https://functions.poehali.dev/6d9be798-b393-4f38-941a-9a2025d8ca11/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      entity_type: 'bath',
      entity_id: bathId,
      rating: rating,
      comment: comment
    })
  });
  
  return response.json();
};

// Получение списка мероприятий
const getEvents = async () => {
  const params = new URLSearchParams({
    type: 'men',
    available_only: true,
    sort: 'date'
  });
  
  const response = await fetch(`https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8/?${params}`);
  return response.json();
};

// Получение детальной информации о событии
const getEvent = async (slug) => {
  const params = new URLSearchParams({
    slug: slug
  });
  
  const response = await fetch(`https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8/?${params}`);
  return response.json();
};

// Регистрация на событие
const registerForEvent = async (eventId) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      event_id: eventId
    })
  });
  
  return response.json();
};

// Отмена регистрации на событие
const cancelEventRegistration = async (eventId) => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams({ event_id: eventId });
  
  const response = await fetch(`https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8/?${params}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Получение моих регистраций
const getMyRegistrations = async () => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams({ my_registrations: true });
  
  const response = await fetch(`https://functions.poehali.dev/3b8cf90b-4e96-4334-84ad-01b48feb63d8/?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Создание бронирования
const createBooking = async (bookingType, entityId, bookingDate, startTime, endTime, guestsCount, notes) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      booking_type: bookingType,
      entity_id: entityId,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      guests_count: guestsCount,
      notes: notes
    })
  });
  
  return response.json();
};

// Получение моих бронирований
const getMyBookings = async (status = null) => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  
  const response = await fetch(`https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f/?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Отмена бронирования
const cancelBooking = async (bookingId, reason) => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams({ booking_id: bookingId });
  
  const response = await fetch(`https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  
  return response.json();
};

// Обновление статуса бронирования
const updateBookingStatus = async (bookingId, status) => {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch('https://functions.poehali.dev/73cedafb-fa7b-4b1d-a5f1-f9be53f7767f/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      booking_id: bookingId,
      status: status
    })
  });
  
  return response.json();
};
```

---

## 📝 Коды ответов

| Код | Описание |
|-----|----------|
| `200` | OK - Успешный запрос |
| `201` | Created - Отзыв создан |
| `400` | Bad Request - Некорректные данные |
| `401` | Unauthorized - Требуется авторизация |
| `404` | Not Found - Ресурс не найден |
| `409` | Conflict - Дубликат отзыва |
| `500` | Internal Server Error - Ошибка сервера |