export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  // Login - usa fetch diretamente (sem interceptor para evitar loop)
  login: async (credentials: LoginDTO): Promise<LoginResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Erro ao fazer login");
    }

    return response.json();
  },

  // Registro - usa fetch diretamente
  register: async (data: RegisterDTO): Promise<LoginResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Erro ao criar conta");
    }

    return response.json();
  },

  // Salvar token no localStorage
  setToken: (token: string) => {
    localStorage.setItem("authToken", token);
  },

  // Obter token do localStorage
  getToken: (): string | null => {
    return localStorage.getItem("authToken");
  },

  // Remover token do localStorage
  removeToken: () => {
    localStorage.removeItem("authToken");
  },

  // Verificar se está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("authToken");
  },

  // Logout - remove token e pode chamar endpoint do backend se necessário
  logout: () => {
    authService.removeToken();
    window.location.href = "/login";
  },
};