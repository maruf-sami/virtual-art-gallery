'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteArtworkButton({ artworkId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm('Delete this artwork permanently?')) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/gallery/delete?id=${encodeURIComponent(artworkId)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.refresh();
            } else {
                const json = await res.json();
                alert(json.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Delete attempt failed', error);
            alert('Delete failed due to a network error.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button onClick={handleDelete} disabled={loading} style={{ padding: '0.55rem 0.9rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Deleting...' : 'Delete'}
        </button>
    );
}
