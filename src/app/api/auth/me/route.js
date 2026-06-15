import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = cookies();
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie) {
      return NextResponse.json({ user: { isLoggedIn: false } }, { status: 200 });
    }

    const token = tokenCookie.value;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ user: { isLoggedIn: false } }, { status: 200 });
    }

    const user = await User.findById(payload.id).select('name role email');

    if (!user) {
      return NextResponse.json({ user: { isLoggedIn: false } }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        isLoggedIn: true,
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/auth/me error', error);
    return NextResponse.json({ user: { isLoggedIn: false } }, { status: 500 });
  }
}
