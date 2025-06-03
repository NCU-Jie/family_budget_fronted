import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp?: number;       // 过期时间（Unix时间戳）
  iat?: number;       // 签发时间
  id?: number;        // 用户ID
  name?: string;      // 用户姓名
  username?: string;  // 用户名
  [key: string]: any; // 其他可能的字段
}

/**
 * 解析JWT token
 * @param token JWT token字符串
 * @returns 解析后的payload对象或null（解析失败时）
 */
export function parseToken(token: string): JwtPayload | null {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (e) {
    console.error('解析token失败:', e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * 检查token有效性
 * @param token JWT token字符串
 * @returns 是否有效
 */
export function isValidToken(token: string): boolean {
  try {
    const decoded = parseToken(token);
    
    // 如果解析失败或没有payload
    if (!decoded) return false;
    
    // 如果没有过期时间字段，认为永远有效
    if (typeof decoded.exp !== 'number') return true;
    
    // 检查是否过期
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (e) {
    console.error('验证token失败:', e instanceof Error ? e.message : e);
    return false;
  }
}