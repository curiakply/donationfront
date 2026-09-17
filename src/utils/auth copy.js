// src/utils/auth.js - Updated version with audit tracking

export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = decodeToken(token);
    if (!decodedToken) return false;

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    const decodedToken = decodeToken(token);
        
    // Store user information separately for easy access
    if (decodedToken) {
      const userInfo = {
        id: decodedToken.id,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role
      };
      localStorage.setItem('user', JSON.stringify(userInfo));
    }
        
    return decodedToken;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return null;
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get current user information
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
        
    // Fallback: decode from token if user info not in storage
    const token = getAuthToken();
    if (token) {
      const decodedToken = decodeToken(token);
      if (decodedToken) {
        const userInfo = {
          id: decodedToken.id,
          name: decodedToken.name,
          email: decodedToken.email,
          role: decodedToken.role
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
        return userInfo;
      }
    }
        
    return null;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

// Get current user's name for createdBy field
export const getCurrentUserName = () => {
  const user = getCurrentUser();
  return user?.name || 'Unknown User';
};

// Get current user's ID
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || null;
};

// Get current user's email
export const getCurrentUserEmail = () => {
  const user = getCurrentUser();
  return user?.email || null;
};

// Check if user has specific role
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user?.role === requiredRole;
};

// Enhanced logout with server-side token invalidation
export const logout = async () => {
  try {
    const token = getAuthToken();
    if (token) {
      // Call logout endpoint to blacklist token
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/Login';
  }
};

export const startTokenExpirationCheck = () => {
  // Check token expiration every minute
  const checkInterval = setInterval(() => {
    if (!isAuthenticated()) {
      clearInterval(checkInterval);
      logout();
    }
  }, 60000); // 60000 ms = 1 minute

  // Also check when the window gains focus
  const handleFocus = () => {
    if (!isAuthenticated()) {
      logout();
    }
  };
    
  window.addEventListener('focus', handleFocus);

  // Clean up on unmount
  return () => {
    clearInterval(checkInterval);
    window.removeEventListener('focus', handleFocus);
  };
};

// NEW AUDIT-RELATED FUNCTIONS

// Get audit logs for current user
export const getCurrentUserAuditLogs = async (options = {}) => {
  const {
    page = 1,
    limit = 50,
    action = 'all',
    startDate = null,
    endDate = null
  } = options;

  const user = getCurrentUser();
  if (!user) return null;

  try {
    const token = getAuthToken();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      action
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`/api/transaction/audit/user/${user.id}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch audit logs');
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    return null;
  }
};

// Get audit logs for a specific transaction
export const getTransactionAuditLogs = async (transactionId, page = 1, limit = 20) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`/api/transaction/audit/${transactionId}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch transaction audit logs');
  } catch (error) {
    console.error('Error fetching transaction audit logs:', error);
    return null;
  }
};

// Get audit summary
export const getAuditSummary = async (options = {}) => {
  const { startDate, endDate, userId } = options;

  try {
    const token = getAuthToken();
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (userId) params.append('userId', userId);

    const response = await fetch(`/api/transaction/audit/summary?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Failed to fetch audit summary');
  } catch (error) {
    console.error('Error fetching audit summary:', error);
    return null;
  }
};