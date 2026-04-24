import { SignJWT, jwtVerify } from 'jose';
import { getCookie, setCookie } from 'vinxi/http';

const secretKey = process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production';
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  setCookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function verifySession() {
  const token = getCookie('auth_token');
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload.userId as string;
  } catch (error) {
    console.error('Failed to verify session');
    return null;
  }
}

export function deleteSession() {
  setCookie('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
