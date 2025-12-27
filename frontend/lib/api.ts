const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Helper to make authenticated requests
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export interface QueueEntry {
  queueNumber: number;
  customerName: string;
  phoneNumber: string;
  service: string;
  position: number;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  estimatedWaitTime: number;
  price?: number;
  joinedAt: string;
}

export interface QueueResponse {
  message: string;
  queueNumber: number;
  position: number;
  estimatedWaitTime: number;
}

export interface PositionResponse {
  queueNumber: number;
  position: number;
  status: string;
  estimatedWaitTime: number;
  customerName: string;
  service?: string;
}

export const queueAPI = {
  joinQueue: async (customerName: string, phoneNumber: string, services: string[]): Promise<QueueResponse> => {
    const response = await fetch(`${API_URL}/queue/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerName, phoneNumber, services }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join queue');
    }

    return response.json();
  },

  getPosition: async (phoneNumber: string): Promise<PositionResponse> => {
    const response = await fetch(`${API_URL}/queue/position/${phoneNumber}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get position');
    }

    return response.json();
  },

  getActiveQueue: async (date?: string): Promise<{ queue: QueueEntry[]; total: number; totalEarnings: number; servedCount: number }> => {
    const query = date ? `?date=${date}` : '';
    const response = await authFetch(`${API_URL}/queue/active${query}`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login.');
      }
      throw new Error('Failed to get active queue');
    }

    return response.json();
  },

  getStats: async (): Promise<{ waiting: number; avgWait: number; servedToday: number; currentQueue: Array<{ name: string; queueNumber: number; status: string; service?: string }>; isOpen: boolean }> => {
    const response = await fetch(`${API_URL}/queue/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch queue stats');
    }
    return response.json();
  },

  getShopStatus: async (): Promise<{ isOpen: boolean }> => {
    const response = await fetch(`${API_URL}/queue/shop-status`);
    if (!response.ok) {
      throw new Error('Failed to get shop status');
    }
    return response.json();
  },

  toggleShopStatus: async (isOpen: boolean): Promise<{ isOpen: boolean }> => {
    const response = await authFetch(`${API_URL}/queue/shop-status`, {
      method: 'POST',
      body: JSON.stringify({ isOpen }),
    });

    if (!response.ok) {
      throw new Error('Failed to update shop status');
    }
    return response.json();
  },

  markServing: async (queueNumber: number): Promise<void> => {
    const response = await authFetch(`${API_URL}/queue/serving/${queueNumber}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login.');
      }
      throw new Error('Failed to mark as serving');
    }
  },

  markComplete: async (queueNumber: number): Promise<void> => {
    const response = await authFetch(`${API_URL}/queue/complete/${queueNumber}`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please login.');
      }
      throw new Error('Failed to mark as complete');
    }
  },

  cancelQueue: async (phoneNumber: string): Promise<void> => {
    const response = await fetch(`${API_URL}/queue/cancel/${phoneNumber}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel queue');
    }
  },
};

// Auth API
export interface User {
  id: string;
  username: string;
  email: string;
  shopName?: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authAPI = {
  register: async (
    username: string,
    email: string,
    password: string,
    shopName?: string,
    phoneNumber?: string
  ): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, shopName, phoneNumber }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register');
    }

    return response.json();
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to login');
    }

    return response.json();
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await authFetch(`${API_URL}/auth/me`);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      throw new Error('Failed to get user');
    }

    return response.json();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },
};

