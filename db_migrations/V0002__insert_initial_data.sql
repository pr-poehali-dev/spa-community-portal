-- Insert initial events data
INSERT INTO events (slug, title, description, date, time, location, type, price, available_spots, total_spots, image_url, program, rules) VALUES
(
  'tradicionnyy-muzhskoy-par',
  'Традиционный мужской парной день',
  'Погружение в атмосферу традиционной русской бани с профессиональным пармастером.',
  '2026-01-18',
  '14:00',
  'Баня на Пресне',
  'men',
  1500,
  3,
  10,
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg',
  '["Встреча участников", "Вводная лекция о банных традициях", "Три захода в парную", "Чаепитие"]'::jsonb,
  '["Приходить за 15 минут", "Иметь при себе полотенце", "Не употреблять алкоголь"]'::jsonb
),
(
  'zhenskoe-wellness-parenie',
  'Женское wellness-парение',
  'Нежное wellness-парение с травяными вениками и ароматерапией.',
  '2026-01-20',
  '16:00',
  'Банный клуб Арбат',
  'women',
  1800,
  5,
  8,
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg',
  '["Знакомство", "Подготовка к парению", "Три захода с вениками", "Травяной чай и отдых"]'::jsonb,
  '["Записываться заранее", "Принести купальный костюм", "Сообщить о противопоказаниях"]'::jsonb
),
(
  'sovmestnyy-bannyy-ritual',
  'Совместный банный ритуал',
  'Совместное мероприятие для пар и друзей в уютной атмосфере.',
  '2026-01-25',
  '18:00',
  'Баня у реки',
  'mixed',
  2000,
  7,
  12,
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg',
  '["Приветствие", "Банные традиции", "Совместное парение", "Банкет"]'::jsonb,
  '["Можно с партнером", "Уважительное поведение", "Соблюдение этикета"]'::jsonb
);

-- Insert initial baths data
INSERT INTO baths (slug, name, address, description, capacity, price_per_hour, features, images, rating, reviews_count) VALUES
(
  'banya-na-presne',
  'Баня на Пресне',
  'Москва, ул. Красная Пресня, 15',
  'Традиционная русская баня с вековой историей в центре Москвы',
  10,
  3000,
  '["Дровяная печь", "Купель с холодной водой", "Комната отдыха", "Веники в подарок"]'::jsonb,
  '["https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg"]'::jsonb,
  4.8,
  127
),
(
  'bannyy-klub-arbat',
  'Банный клуб Арбат',
  'Москва, Арбат, 28',
  'Современный спа-комплекс с аутентичной парной',
  8,
  3500,
  '["Инфракрасная сауна", "Массажный кабинет", "Бассейн", "Караоке"]'::jsonb,
  '["https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg"]'::jsonb,
  4.9,
  203
);

-- Insert initial masters data
INSERT INTO masters (slug, name, specialization, experience, description, avatar_url, services, rating, reviews_count) VALUES
(
  'ivan-parmaster',
  'Иван Петров',
  'Традиционное парение',
  15,
  'Профессиональный пармастер с 15-летним стажем. Специализируюсь на классических техниках русской бани.',
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg',
  '[{"name": "Классическое парение", "price": 2000, "duration": 60}, {"name": "Парение с массажем", "price": 3500, "duration": 90}, {"name": "Групповой сеанс", "price": 5000, "duration": 120}]'::jsonb,
  4.9,
  89
),
(
  'maria-wellness',
  'Мария Соколова',
  'Wellness-парение',
  8,
  'Специалист по оздоровительным практикам и травяным процедурам в бане.',
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg',
  '[{"name": "Wellness-парение", "price": 2500, "duration": 75}, {"name": "Ароматерапия", "price": 3000, "duration": 90}, {"name": "Женский сеанс", "price": 3500, "duration": 120}]'::jsonb,
  5.0,
  156
);

-- Insert initial blog posts data
INSERT INTO blog_posts (slug, title, excerpt, content, category, author, date, image_url) VALUES
(
  'kak-pravilno-paritsya',
  'Как правильно париться: гид для начинающих',
  'Основные правила безопасного и эффективного парения в русской бане',
  'Полный текст статьи о правилах парения...',
  'rituals',
  'Иван Петров',
  '2026-01-10',
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'
),
(
  'polza-bani-dlya-zdorovya',
  'Польза бани для здоровья: научный подход',
  'Что говорит медицина о влиянии банных процедур на организм',
  'Полный текст статьи о пользе бани...',
  'health',
  'Мария Соколова',
  '2026-01-08',
  'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg'
);