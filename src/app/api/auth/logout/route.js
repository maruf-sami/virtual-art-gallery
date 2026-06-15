import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logged out' }, { status: 200 });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Logout error', err);
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
  }
}
