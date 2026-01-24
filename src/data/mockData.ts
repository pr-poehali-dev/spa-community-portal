export interface Event {
  id: number;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'men' | 'women' | 'mixed';
  price: number;
  availableSpots: number;
  totalSpots: number;
  image: string;
  description?: string;
  program?: string[];
  rules?: string[];
}

export interface Bath {
  id: number;
  slug: string;
  name: string;
  address: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  features: string[];
  images: string[];
  rating: number;
  reviewsCount: number;
}

export interface Master {
  id: number;
  slug: string;
  name: string;
  specialization: string;
  experience: number;
  description: string;
  avatar: string;
  services: { name: string; price: number; duration: number }[];
  rating: number;
  reviewsCount: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'rituals' | 'health' | 'diy' | 'history';
  author: string;
  date: string;
  image: string;
}

export const mockEvents: Event[] = [
  {
    id: 1,
    slug: 'tradicionnyy-muzhskoy-par',
    title: 'Традиционный мужской парной день',
    date: '2026-01-18',
    time: '14:00',
    location: 'Баня на Пресне',
    type: 'men',
    price: 1500,
    availableSpots: 3,
    totalSpots: 10,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg',
    description: 'Погружение в атмосферу традиционной русской бани с профессиональным пармастером.',
    program: ['Встреча участников', 'Вводная лекция о банных традициях', 'Три захода в парную', 'Чаепитие'],
    rules: ['Приходить за 15 минут', 'Иметь при себе полотенце', 'Не употреблять алкоголь']
  },
  {
    id: 2,
    slug: 'zhenskoe-wellness-parenie',
    title: 'Женское wellness-парение',
    date: '2026-01-20',
    time: '16:00',
    location: 'Банный клуб Арбат',
    type: 'women',
    price: 1800,
    availableSpots: 5,
    totalSpots: 8,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg',
    description: 'Нежное wellness-парение с травяными вениками и ароматерапией.',
    program: ['Знакомство', 'Подготовка к парению', 'Три захода с вениками', 'Травяной чай и отдых'],
    rules: ['Записываться заранее', 'Принести купальный костюм', 'Сообщить о противопоказаниях']
  },
  {
    id: 3,
    slug: 'sovmestnyy-bannyy-ritual',
    title: 'Совместный банный ритуал',
    date: '2026-01-25',
    time: '18:00',
    location: 'Баня у реки',
    type: 'mixed',
    price: 2000,
    availableSpots: 7,
    totalSpots: 12,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg',
    description: 'Совместное мероприятие для пар и друзей в уютной атмосфере.',
    program: ['Приветствие', 'Банные традиции', 'Совместное парение', 'Банкет'],
    rules: ['Можно с партнером', 'Уважительное поведение', 'Соблюдение этикета']
  },
];

export const mockBaths: Bath[] = [
  {
    id: 1,
    slug: 'banya-na-presne',
    name: 'Баня на Пресне',
    address: 'Москва, ул. Красная Пресня, 15',
    description: 'Традиционная русская баня с вековой историей в центре Москвы',
    capacity: 10,
    pricePerHour: 3000,
    features: ['Дровяная печь', 'Купель с холодной водой', 'Комната отдыха', 'Веники в подарок'],
    images: ['https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'],
    rating: 4.8,
    reviewsCount: 127
  },
  {
    id: 2,
    slug: 'bannyy-klub-arbat',
    name: 'Банный клуб Арбат',
    address: 'Москва, Арбат, 28',
    description: 'Современный спа-комплекс с аутентичной парной',
    capacity: 8,
    pricePerHour: 3500,
    features: ['Инфракрасная сауна', 'Массажный кабинет', 'Бассейн', 'Караоке'],
    images: ['https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg'],
    rating: 4.9,
    reviewsCount: 203
  },
  {
    id: 3,
    slug: 'banya-u-reki',
    name: 'Баня у реки',
    address: 'Москва, Набережная Тараса Шевченко, 23',
    description: 'Панорамная баня с видом на реку и уютной атмосферой',
    capacity: 12,
    pricePerHour: 4000,
    features: ['Панорамные окна', 'Открытая терраса', 'Мангал', 'Караоке-зал'],
    images: ['https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg'],
    rating: 4.7,
    reviewsCount: 94
  },
  {
    id: 4,
    slug: 'kupecheskaya-banya',
    name: 'Купеческая баня',
    address: 'Москва, ул. Пятницкая, 10',
    description: 'Исторический комплекс с классическим интерьером XIX века',
    capacity: 15,
    pricePerHour: 5000,
    features: ['Дубовая отделка', 'Антикварная мебель', 'Банкетный зал', 'Бильярд'],
    images: ['https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'],
    rating: 5.0,
    reviewsCount: 215
  },
];

export const mockMasters: Master[] = [
  {
    id: 1,
    slug: 'ivan-parmaster',
    name: 'Иван Петров',
    specialization: 'Традиционное парение',
    experience: 15,
    description: 'Профессиональный пармастер с 15-летним стажем. Специализируюсь на классических техниках русской бани.',
    avatar: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg',
    services: [
      { name: 'Классическое парение', price: 2000, duration: 60 },
      { name: 'Парение с массажем', price: 3500, duration: 90 },
      { name: 'Групповой сеанс', price: 5000, duration: 120 }
    ],
    rating: 4.9,
    reviewsCount: 89
  },
  {
    id: 2,
    slug: 'maria-wellness',
    name: 'Мария Соколова',
    specialization: 'Wellness-парение',
    experience: 8,
    description: 'Специалист по оздоровительным практикам и травяным процедурам в бане.',
    avatar: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg',
    services: [
      { name: 'Wellness-парение', price: 2500, duration: 75 },
      { name: 'Ароматерапия', price: 3000, duration: 90 },
      { name: 'Женский сеанс', price: 3500, duration: 120 }
    ],
    rating: 5.0,
    reviewsCount: 156
  },
  {
    id: 3,
    slug: 'sergey-master',
    name: 'Сергей Васильев',
    specialization: 'Экстремальное парение',
    experience: 12,
    description: 'Мастер контрастных процедур и высокотемпературного парения для подготовленных любителей бани.',
    avatar: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg',
    services: [
      { name: 'Контрастное парение', price: 2200, duration: 60 },
      { name: 'Спортивное парение', price: 3000, duration: 75 },
      { name: 'Мастер-класс', price: 4000, duration: 120 }
    ],
    rating: 4.8,
    reviewsCount: 67
  },
  {
    id: 4,
    slug: 'olga-aromatherapy',
    name: 'Ольга Николаева',
    specialization: 'Ароматерапия и релакс',
    experience: 10,
    description: 'Специалист по эфирным маслам и расслабляющим банным практикам с многолетним опытом.',
    avatar: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg',
    services: [
      { name: 'Релакс-парение', price: 2800, duration: 90 },
      { name: 'Ароматический сеанс', price: 3200, duration: 90 },
      { name: 'Антистресс программа', price: 4500, duration: 150 }
    ],
    rating: 4.9,
    reviewsCount: 132
  },
];

export const mockBlogPosts: BlogPost[] = [
  {
    id: 1,
    slug: 'kak-pravilno-paritsya',
    title: 'Как правильно париться: гид для начинающих',
    excerpt: 'Основные правила безопасного и эффективного парения в русской бане',
    content: 'Полный текст статьи о правилах парения...',
    category: 'rituals',
    author: 'Иван Петров',
    date: '2026-01-10',
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'
  },
  {
    id: 2,
    slug: 'polza-bani-dlya-zdorovya',
    title: 'Польза бани для здоровья: научный подход',
    excerpt: 'Что говорит медицина о влиянии банных процедур на организм',
    content: 'Полный текст статьи о пользе бани...',
    category: 'health',
    author: 'Мария Соколова',
    date: '2026-01-08',
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg'
  },
  {
    id: 3,
    slug: 'vidy-venikov',
    title: 'Виды веников и их свойства',
    excerpt: 'Березовый, дубовый, эвкалиптовый — разбираемся в традиционных вениках',
    content: 'Статья о разных видах веников для бани...',
    category: 'rituals',
    author: 'Иван Петров',
    date: '2026-01-05',
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg'
  },
  {
    id: 4,
    slug: 'istoriya-russkoy-bani',
    title: 'История русской бани: от древности до наших дней',
    excerpt: 'Как баня стала неотъемлемой частью русской культуры',
    content: 'Историческая статья о русской бане...',
    category: 'history',
    author: 'Александр Смирнов',
    date: '2026-01-03',
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'
  },
  {
    id: 5,
    slug: 'banya-i-immunitet',
    title: 'Баня и иммунитет: как укрепить здоровье',
    excerpt: 'Регулярное посещение бани укрепляет иммунную систему',
    content: 'Статья о влиянии бани на иммунитет...',
    category: 'health',
    author: 'Мария Соколова',
    date: '2026-01-01',
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg'
  },
  {
    id: 6,
    slug: 'kak-sdelat-venik',
    title: 'Как сделать веник своими руками',
    excerpt: 'Пошаговая инструкция по заготовке и вязке банных веников',
    content: 'DIY руководство по изготовлению веника...',
    category: 'diy',
    author: 'Сергей Васильев',
    date: '2025-12-28',
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg'
  },
];