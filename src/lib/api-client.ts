class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Printers API
  async getPrinters(params?: {
    department?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    printerId?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/printers${query ? `?${query}` : ''}`);
  }

  async createPrinter(data: any) {
    return this.request('/printers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePrinter(id: string, data: any) {
    return this.request(`/printers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePrinter(id: string) {
    return this.request(`/printers/${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getUsers(params?: {
    department?: string;
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Print Jobs API
  async getPrintJobs(params?: {
    userId?: string;
    printerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/print-jobs${query ? `?${query}` : ''}`);
  }

  async createPrintJob(data: {
    userId: string;
    printerId: string;
    fileName: string;
    pages: number;
    copies: number;
    isColor: boolean;
  }) {
    return this.request('/print-jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Services API
  async getAIAnalysis(params?: {
    period?: number;
    department?: string;
    userId?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/ai/analysis${query ? `?${query}` : ''}`);
  }

  async getAIRecommendations(params?: {
    department?: string;
    userId?: string;
    type?: 'general' | 'cost' | 'sustainability' | 'efficiency';
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/ai/recommendations${query ? `?${query}` : ''}`);
  }

  async sendAIMessage(data: {
    message: string;
    userId?: string;
    includeContext?: boolean;
  }) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reports API
  async getReports(params?: {
    dateRange?: number;
    reportType?: string;
  }) {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return this.request(`/reports${query ? `?${query}` : ''}`);
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getSettingSection(section: string) {
    return this.request('/settings', {
      method: 'POST',
      body: JSON.stringify({ section }),
    });
  }
}

export const apiClient = new ApiClient();