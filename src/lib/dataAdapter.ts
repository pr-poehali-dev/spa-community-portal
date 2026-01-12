import * as API from './api';

export function adaptEvent(event: API.Event) {
  return {
    ...event,
    image: event.image_url,
    availableSpots: event.available_spots,
    totalSpots: event.total_spots
  };
}

export function adaptBath(bath: API.Bath) {
  return {
    ...bath,
    pricePerHour: bath.price_per_hour,
    reviewsCount: bath.reviews_count
  };
}

export function adaptMaster(master: API.Master) {
  return {
    ...master,
    avatar: master.avatar_url,
    reviewsCount: master.reviews_count
  };
}

export function adaptBlogPost(post: API.BlogPost) {
  return {
    ...post,
    image: post.image_url
  };
}
