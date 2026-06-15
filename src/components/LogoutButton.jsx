'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton({ className }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            
            window.location.href = '/';
        }
    }

    return (
        <button onClick={handleLogout} className={className} disabled={loading}>
            {loading ? 'Logging out...' : 'Log Out'}
        </button>
    );
}
