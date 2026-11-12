export const dynamic = 'force-dynamic';

import DeleteArtworkButton from '@/src/components/DeleteArtworkButton';
import LogoutButton from '@/src/components/LogoutButton';
import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import Artwork from '@/src/models/artWork';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Link from 'next/link';
import styles from './profile.module.css';

export default async function ProfilePage() {
    let user = null;
    let uploadedArtworks = [];
    let collectedArtworks = [];

    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get('token');
        if (tokenCookie) {
            const token = tokenCookie.value;
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            if (payload?.id) {
                await connectDB();
                user = await User.findById(payload.id).select('name email role avatar collectedArtworks uploadedArtworks');

                if (user) {

                    const collectedIds = user.collectedArtworks || [];
                    if (collectedIds.length > 0) {
                        collectedArtworks = await Artwork.find({ _id: { $in: collectedIds } }).sort({ createdAt: -1 }).lean();
                    }

                    'artist'
                    if (user.role === 'artist') {
                        const uploadedIds = user.uploadedArtworks || [];
                        uploadedArtworks = uploadedIds.length > 0
                            ? await Artwork.find({ _id: { $in: uploadedIds } }).sort({ createdAt: -1 }).lean()
                            : await Artwork.find({ artistId: payload.id }).sort({ createdAt: -1 }).lean();
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error loading profile page', err);
    }

    if (!user) {
        return (
            <div className={styles.profileContainer} style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlignment: 'center', maxWidth: '400px', padding: '2rem', backgroundColor: '#1C1B1B', border: '1px solid rgba(233,195,73,0.2)' }}>
                    <h2 style={{ fontFamily: 'Noto Serif, serif', color: '#E5E2E1', marginBottom: '1rem' }}>Please log in to view your profile</h2>
                    <Link href="/auth" style={{ color: '#E9C349', textDecoration: 'underline', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' }}>Go to Log In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            { }
            <div className={styles.header}>
                <div className={styles.avatar}>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <div className={styles.info}>
                    <h1 className={styles.name}>{user.name}</h1>
                    <p className={styles.email}>{user.email}</p>
                    <p className={styles.role}>{user.role === 'artist' ? 'Artist' : 'Visitor'}</p>
                </div>
                <div className={styles.headerActions}>
                    <LogoutButton className={styles.logoutBtn} />
                </div>
            </div>

            { }
            {user.role === 'artist' && (
                <div className={styles.section} style={{ marginBottom: '4rem' }}>
                    <h2>Your Exhibition</h2>
                    {uploadedArtworks.length === 0 ? (
                        <p>You haven't uploaded any artworks yet.</p>
                    ) : (
                        <div className={styles.grid}>
                            {uploadedArtworks.map((art) => (
                                <div key={art._id} className={styles.card}>
                                    <Link href={`/gallery/${art._id}`} className={styles.cardLink}>
                                        <div className={styles.thumb}>
                                            <img src={art.image} alt={art.title} />
                                        </div>
                                        <div className={styles.meta}>
                                            <h3>{art.title}</h3>
                                            <span className={styles.cat}>{art.category}</span>
                                        </div>
                                    </Link>
                                    <div className={styles.cardActions}>
                                        <DeleteArtworkButton artworkId={art._id.toString()} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.section}>
                <h2>Collected Artworks</h2>
                {collectedArtworks.length === 0 ? (
                    <p>You haven't collected any artworks yet.</p>
                ) : (
                    <div className={styles.grid}>
                        {collectedArtworks.map((art) => (
                            <div key={art._id} className={styles.card}>
                                <Link href={`/gallery/${art._id}`} className={styles.cardLink}>
                                    <div className={styles.thumb}>
                                        <img src={art.image} alt={art.title} />
                                    </div>
                                    <div className={styles.meta}>
                                        <h3>{art.title}</h3>
                                        <span className={styles.cat}>{art.category}</span>
                                    </div>
                                </Link>
                                { }
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}