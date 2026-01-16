# 🏛️ Catalog & Reviews API

Документация для работы с каталогом бань, мастеров и отзывами.

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
