// API Error class with additional context
export class ApiError extends Error {
  constructor(message, status, body, url) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export async function apiFetch(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = baseUrl + path;

  // Set up headers - only add Content-Type if there's a body
  const headers = { ...(options.headers || {}) };
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  const opts = { ...options, headers };

  // Serialize body if it's an object
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }

  // Log request in development
  if (import.meta.env.DEV) {
    console.log(`[API Request] ${opts.method || 'GET'} ${url}`, opts.body ? JSON.parse(opts.body) : '');
  }

  try {
    const res = await fetch(url, opts);

    // Handle non-OK responses
    if (!res.ok) {
      const text = await res.text();
      let body = text;
      
      try {
        body = JSON.parse(text);
      } catch {
        // Response is not JSON, keep as text
        if (import.meta.env.DEV) {
          console.error(`[API Error] Non-JSON error response from ${url}`);
        }
      }

      const errorMessage = (body && body.message) || res.statusText || 'API request failed';
      const error = new ApiError(errorMessage, res.status, body, url);
      
      // Log error in development
      if (import.meta.env.DEV) {
        console.error(`[API Error] ${res.status} ${opts.method || 'GET'} ${url}`, error.body);
      }
      
      throw error;
    }

    // Parse successful response
    const contentType = res.headers.get('content-type') || '';
    const responseData = contentType.includes('application/json') ? await res.json() : await res.text();
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${res.status} ${opts.method || 'GET'} ${url}`, responseData);
    }
    
    return responseData;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new ApiError(
        'Network error - please check your connection',
        0,
        { network: true, originalError: error.message },
        url
      );
      
      if (import.meta.env.DEV) {
        console.error(`[API Network Error] ${opts.method || 'GET'} ${url}`, error);
      }
      
      throw networkError;
    }
    
    // Re-throw ApiError instances
    throw error;
  }
}
