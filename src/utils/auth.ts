// src/utils/auth.ts
export const isValidToken = (token: string): boolean => {
    try {
      const payload = parseJWT(token);
      return payload.exp > Date.now() / 1000; // 检查过期时间
    } catch {
      return false;
    }
  };
  
  export const parseJWT = (token: string) => {
    const base64Payload = token.split('.')[1];
    return JSON.parse(atob(base64Payload));
  };