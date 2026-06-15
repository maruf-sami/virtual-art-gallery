import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: "No token found" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id).select('-password');
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Auth GET Error:", error);
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { action, name, email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (action === 'signup') {
      if (!name || name.trim().length < 3) {
        return NextResponse.json(
          { message: 'Name must be at least 3 characters' },
          { status: 400 }
        );
      }

      if (password.length < 8) {
        return NextResponse.json(
          { message: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'visitor',
      });

      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json(
        {
          message: 'Registration successful',
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
          },
        },
        { status: 201 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    if (action === 'login') {
      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 400 }
        );
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 400 }
        );
      }

      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
          },
        },
        { status: 200 }
      );

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
