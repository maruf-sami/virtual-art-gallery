
import Navbar from '@/src/components/Navbar';
import './globals.css';

import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Virtual Art Gallery',
  description: 'Immersive digital space for classical and digital masterpieces.',
};

export default async function RootLayout({ children }) {
  let currentUser = { isLoggedIn: false };

  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('token');

    if (tokenCookie) {
      const token = tokenCookie.value;
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload?.id) {
          await connectDB();
          const user = await User.findById(payload.id).select('name role email');
          if (user) {
            currentUser = {
              isLoggedIn: true,
              id: user._id.toString(),
              name: user.name,
              role: user.role,
              email: user.email,
            };
          }
        }
      } catch (err) {
        console.error('Token verify failed in RootLayout', err);
      }
    }
  } catch (err) {
    console.error('Error resolving user in RootLayout', err);
  }

  return (
    <html lang="en">
      <body>
        <Navbar user={currentUser} />

        {children}
      </body>
    </html>
  );
}
