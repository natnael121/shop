import { MenuItem } from '../types';

// Mock service for client-side use
// In production, this should be replaced with API calls to a backend service
class GoogleSheetsService {
  async getMenuItems(): Promise<MenuItem[]> {
    // Return demo data since googleapis can't run in browser
    // In production, this should make HTTP requests to your backend API
    return this.getDemoMenuItems();
  }

  async updateItemStats(itemId: string, field: 'views' | 'orders', increment: number = 1) {
    // In production, this should make HTTP requests to your backend API
    console.log(`Would update ${field} for item ${itemId} by ${increment}`);
    
    // Store stats locally for now
    const stats = JSON.parse(localStorage.getItem('itemStats') || '{}');
    if (!stats[itemId]) {
      stats[itemId] = { views: 0, orders: 0 };
    }
    stats[itemId][field] = (stats[itemId][field] || 0) + increment;
    localStorage.setItem('itemStats', JSON.stringify(stats));
  }

  private getDemoMenuItems(): MenuItem[] {
    return [
      {
        id: '1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 89.99,
        photo: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
        category: 'Electronics',
        available: true,
        preparation_time: 1,
        ingredients: 'Plastic, Metal, Electronics',
        allergens: 'None',
        popularity_score: 95,
        views: 150,
        orders: 45,
        last_updated: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors',
        price: 24.99,
        photo: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
        category: 'Clothing',
        available: true,
        preparation_time: 0,
        ingredients: '100% Cotton',
        allergens: 'None',
        popularity_score: 88,
        views: 120,
        orders: 32,
        last_updated: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Coffee Mug',
        description: 'Ceramic coffee mug with ergonomic handle',
        price: 12.99,
        photo: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
        category: 'Home & Kitchen',
        available: true,
        preparation_time: 0,
        ingredients: 'Ceramic',
        allergens: 'None',
        popularity_score: 92,
        views: 98,
        orders: 28,
        last_updated: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Notebook Set',
        description: 'Set of 3 lined notebooks for writing and note-taking',
        price: 15.99,
        photo: 'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg',
        category: 'Stationery',
        available: true,
        preparation_time: 0,
        ingredients: 'Paper, Cardboard',
        allergens: 'None',
        popularity_score: 85,
        views: 89,
        orders: 25,
        last_updated: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Phone Case',
        description: 'Protective phone case with shock absorption',
        price: 19.99,
        photo: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
        category: 'Accessories',
        available: true,
        preparation_time: 0,
        ingredients: 'Silicone, Plastic',
        allergens: 'None',
        popularity_score: 90,
        views: 75,
        orders: 18,
        last_updated: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Desk Lamp',
        description: 'LED desk lamp with adjustable brightness',
        price: 34.99,
        photo: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
        category: 'Home & Office',
        available: true,
        preparation_time: 0,
        ingredients: 'Metal, LED, Plastic',
        allergens: 'None',
        popularity_score: 80,
        views: 65,
        orders: 22,
        last_updated: new Date().toISOString(),
      },
    ];
  }
}

export const googleSheetsService = new GoogleSheetsService();