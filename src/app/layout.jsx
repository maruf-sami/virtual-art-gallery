import Navbar from '@/src/components/Navbar'; 
import './globals.css'; 

export const metadata = {
  title: 'Virtual Art Gallery',
  description: 'Immersive digital space for classical and digital masterpieces.',
};

export default function RootLayout({ children }) {

  const currentUser = {
    isLoggedIn: false, 
    name: 'Alex'
  };

  return (
    <html lang="en">
      <body>
        <Navbar user={currentUser} />
        
        {children}
      </body>
    </html>
  );
}
