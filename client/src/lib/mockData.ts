// Mock data for demo purposes
export const mockServices = [
  {
    id: '1',
    name: 'Cleaning Service',
    description: 'Professional home cleaning service',
    price: 150000,
    category: 'Home Services',
    image_url: '/placeholder-service-1.jpg',
    is_active: true
  },
  {
    id: '2',
    name: 'AC Repair',
    description: 'Air conditioner maintenance and repair',
    price: 250000,
    category: 'Maintenance',
    image_url: '/placeholder-service-2.jpg',
    is_active: true
  },
  {
    id: '3',
    name: 'Plumbing Service',
    description: 'Professional plumbing solutions',
    price: 200000,
    category: 'Maintenance',
    image_url: '/placeholder-service-3.jpg',
    is_active: true
  }
];

export const mockBanners = [
  {
    id: '1',
    title: 'Welcome to GetLife',
    description: 'Your trusted service platform',
    image_url: '/placeholder-banner-1.jpg',
    is_active: true,
    order_index: 1
  },
  {
    id: '2',
    title: 'Special Discount',
    description: '20% off for new customers',
    image_url: '/placeholder-banner-2.jpg',
    is_active: true,
    order_index: 2
  }
];

export const mockOrders = [
  {
    id: '1',
    service_name: 'Cleaning Service',
    status: 'completed',
    total_amount: 150000,
    scheduled_date: '2024-01-15',
    created_at: '2024-01-10'
  },
  {
    id: '2',
    service_name: 'AC Repair',
    status: 'in_progress',
    total_amount: 250000,
    scheduled_date: '2024-01-20',
    created_at: '2024-01-18'
  }
];

export const mockVouchers = [
  {
    id: '1',
    code: 'WELCOME20',
    name: 'Welcome Bonus',
    description: '20% discount for new users',
    discount_type: 'percentage',
    discount_value: 20,
    min_purchase: 100000,
    is_active: true
  },
  {
    id: '2',
    code: 'SAVE50K',
    name: 'Save 50K',
    description: 'Rp 50,000 off your next order',
    discount_type: 'fixed',
    discount_value: 50000,
    min_purchase: 200000,
    is_active: true
  }
];