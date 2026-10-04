export const hotel = {
  name: 'Hotel Bhola Inn',
  city: 'Bettiah',
  address: 'Station Chowk, Supriya Cinema Road, Bettiah, West Champaran, Bihar 845438',
  phone: '+91 91555 90188',
  rating: 3.8,
  reviewCount: 474,
  category: '3-star hotel · restaurant · stay',
  mapQuery: 'Hotel Bhola Inn, Station Chowk, Supriya Cinema Road, Bettiah, Bihar 845438',
  bookingSite: 'https://hotel-bhola-inn.business.site/',
  officialSiteHint: 'www.hotelbholainn.com',
  checkIn: '12:00 PM',
  checkOut: '11:00 AM',
};

export const rooms = [
  {
    id: 'deluxe',
    name: 'Deluxe Room',
    size: '200 sq ft',
    guests: 2,
    bed: '1 King Bed',
    bath: '1 Bathroom',
    price: 2200,
    image: 'https://r1imghtlak.ibcdn.com/d3b83f9a-7cf4-458e-a0c1-110e0aba0b19.jpeg',
    features: ['Air conditioning', 'Mineral water', 'Telephone', 'Chair', 'Kettle'],
  },
  {
    id: 'suite',
    name: 'Suite Room',
    size: '400 sq ft',
    guests: 2,
    bed: '1 King Bed',
    bath: '1 Bathroom',
    price: 3200,
    image: 'https://r1imghtlak.ibcdn.com/df2e80d1-3c61-448a-88e9-a9f78aa56c5b.jpeg',
    features: ['Air conditioning', 'Mineral water', 'Iron / ironing board', 'Telephone', 'Chair'],
  },
];

export const amenities = [
  'Restaurant', 'Room service', 'Air conditioning', 'Free public parking',
  'Laundry service', 'Free Wi-Fi', 'Luggage assistance', 'CCTV',
  'Fire extinguishers', 'Toiletries',
];

export const photos = [
  { src: 'https://lbcdn.airpaz.com/hotelimages/654542/bhola-clarks-inn-601784650b3fd24be8b4a25c24c6ab21.jpg', label: 'Hotel exterior' },
  { src: 'https://r1imghtlak.ibcdn.com/df2e80d1-3c61-448a-88e9-a9f78aa56c5b.jpeg', label: 'Guest room' },
  { src: 'https://r1imghtlak.ibcdn.com/c273f86f-b61f-4521-ab20-eb01decc95df.jpeg', label: 'Property gallery' },
  { src: 'https://r1imghtlak.ibcdn.com/97c19b98-c584-4a3b-8453-9f6a9048eb75.jpeg', label: 'Property gallery' },
  { src: 'https://r1imghtlak.ibcdn.com/653ecc80-d94c-408e-af74-942780604ded.jpeg', label: 'Property gallery' },
];

export const reviews = [
  { source: 'Google / Restaurant Guru', rating: 5, title: 'Good food, genuine price', text: 'Food is good. Genuine price.', period: 'recent listing review' },
  { source: 'MakeMyTrip', rating: 5, title: 'Comfortable stay', text: 'Rooms are spacious, neat, and clean with the restaurant inside the hotel.', period: 'Mar 2026' },
  { source: 'MakeMyTrip', rating: 5, title: 'Pleasant stay', text: 'A family stay described as safe, with positive comments about food, rooms and customer service.', period: 'Aug 2025' },
  { source: 'MakeMyTrip', rating: 2, title: 'Internet / room upkeep concern', text: 'One recent review reported unavailable internet; another mentioned slow geyser heating and bed cleanliness.', period: 'Jan–Apr 2026' },
];

export const social = [
  { label: 'YouTube mention', url: 'https://www.youtube.com/watch?v=AaKtj3usrmg' },
];