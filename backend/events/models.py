"""Модели данных для Events API"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime

class EventListItem(BaseModel):
    """Элемент списка событий"""
    id: int
    slug: str
    title: str
    description: Optional[str] = None
    date: str
    time: str
    location: str
    type: str
    price: int
    available_spots: int
    total_spots: int
    image_url: Optional[str] = None

class EventDetail(EventListItem):
    """Детальная информация о событии"""
    program: List[str] = Field(default_factory=list)
    rules: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None

class RegistrationRequest(BaseModel):
    """Запрос на регистрацию"""
    event_id: int = Field(..., gt=0)

class EventRegistration(BaseModel):
    """Регистрация на событие"""
    id: int
    event_id: int
    status: str
    registered_at: Optional[str] = None
    canceled_at: Optional[str] = None
