import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'supersecretjwtkey_please_change_in_production';
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
  
  return token;
}

export async function verifySession(token: string | undefined) {
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

export function getClearSessionCookie() {
  return `auth_token=; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=0`;
}
