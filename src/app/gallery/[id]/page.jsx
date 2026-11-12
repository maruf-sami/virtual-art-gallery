"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import styles from './art-details.module.css';

export default function ArtworkDetailsPage({ params }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);
    const artworkId = unwrappedParams.id;

    const [artwork, setArtwork] = useState(null);
    const [loading, setLoading] = useState(true);

    const [currentUserId, setCurrentUserId] = useState(null);
    const [isCollected, setIsCollected] = useState(false);
    const [collecting, setCollecting] = useState(false);
    const [collectStatus, setCollectStatus] = useState({ text: '', isError: false });

    const [comments, setComments] = useState([]);
    const [mainCommentText, setMainCommentText] = useState("");
    const [replyTextMap, setReplyTextMap] = useState({});
    const [activeReplyBox, setActiveReplyBox] = useState(null);

    useEffect(() => {
        async function initPage() {
            try {
                const artRes = await fetch(`/api/gallery/${artworkId}`);
                if (artRes.ok) {
                    const artData = await artRes.json();
                    setArtwork(artData);
                }

                const checkRes = await fetch(`/api/gallery/collect?artworkId=${artworkId}`);
                if (checkRes.ok) {
                    const checkData = await checkRes.json();
                    setIsCollected(checkData.isCollected);
                    if (checkData.currentUserId) {
                        setCurrentUserId(checkData.currentUserId);
                    }
                }

                fetchComments();
            } catch (error) {
                console.error("Error loading artwork info:", error);
            } finally {
                setLoading(false);
            }
        }
        initPage();

        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth');
                if (res.ok) {
                    const uData = await res.json();
                    setCurrentUserId(uData.id || uData._id);
                }
            } catch (e) {
                console.error("Error fetching current user profile:", e);
            }
        };
        fetchUserData();
    }, [artworkId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/gallery/comments?artworkId=${artworkId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error("Error loading comments:", err);
        }
    };

    const handleToggleCollect = async () => {
        setCollecting(true);
        setCollectStatus({ text: '', isError: false });
        const currentAction = isCollected ? 'remove' : 'collect';

        try {
            const res = await fetch('/api/gallery/collect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artworkId, action: currentAction })
            });

            if (res.status === 401) {
                setCollectStatus({ text: "Redirecting to login...", isError: true });
                setTimeout(() => router.push(`/auth?callbackUrl=/gallery/${artworkId}`), 800);
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setCollectStatus({ text: data.message, isError: false });
                setIsCollected(!isCollected);
            }
        } catch (err) {
            setCollectStatus({ text: "Connection error. Try again.", isError: true });
        } finally {
            setCollecting(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!mainCommentText.trim()) return;

        try {
            const res = await fetch('/api/gallery/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artworkId, text: mainCommentText })
            });

            if (res.status === 401) {
                setMainCommentText("");
                alert("Please log in to share your thoughts on this masterpiece.");
                router.push(`/auth?callbackUrl=/gallery/${artworkId}`);
                return;
            }

            const rawText = await res.text();
            if (res.ok) {
                setMainCommentText("");
                fetchComments();
            } else {
                const errData = rawText ? JSON.parse(rawText) : {};
                alert(errData.message || "Action failed");
            }
        } catch (err) {
            console.error("Comment posting error:", err);
        }
    };

    const handlePostReply = async (commentId) => {
        const text = replyTextMap[commentId];
        if (!text || !text.trim()) return;

        try {
            const res = await fetch('/api/gallery/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artworkId, text, commentId })
            });

            if (res.status === 401) {
                setReplyTextMap({ ...replyTextMap, [commentId]: "" });
                setActiveReplyBox(null);
                alert("Please log in to reply to this discussion.");
                router.push(`/auth?callbackUrl=/gallery/${artworkId}`);
                return;
            }

            const rawText = await res.text();
            if (res.ok) {
                setReplyTextMap({ ...replyTextMap, [commentId]: "" });
                setActiveReplyBox(null);
                fetchComments();
            } else {
                const errData = rawText ? JSON.parse(rawText) : {};
                alert(errData.message || "Failed to post reply");
            }
        } catch (err) {
            console.error("Reply posting error:", err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch('/api/gallery/comments', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ commentId, artworkId })
            });

            const rawText = await res.text();
            if (res.ok) {
                fetchComments();
            } else {
                const errData = rawText ? JSON.parse(rawText) : {};
                alert(errData.message || "Unauthorized to delete");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const getUserProfileLink = (role, name) => {
        if (role === 'artist') return `/artists/${encodeURIComponent(name || 'unknown')}`;
        return `/visitors/${encodeURIComponent(name || 'unknown')}`;
    };

    if (loading) {
        return (
            <div className={styles.fallbackContainer}>
                <p className={styles.statusText}>Loading artwork details from studio...</p>
            </div>
        );
    }

    if (!artwork) {
        return (
            <div className={styles.fallbackContainer}>
                <h2 className={styles.errorTitle}>Artwork Not Found</h2>
                <button onClick={() => router.push('/gallery')} className={styles.backLinkBtn}>Back to Gallery</button>
            </div>
        );
    }

    return (
        <div className={styles.detailsContainer}>
            <div className={styles.canvasWrapper}>

                <button onClick={() => router.back()} className={styles.backArrowBtn} title="Go Back">
                    <span className={styles.arrowIcon}>←</span>
                </button>

                <main className={styles.mainWrapper}>
                    <div className={styles.imageSection}>
                        <div className={styles.imageCage}>
                            <img src={artwork.image} alt={artwork.title} className={styles.displayImage} />
                        </div>
                    </div>

                    <aside className={styles.infoSection}>
                        <div className={styles.titleBlock}>
                            <h1 className={styles.artTitle}>{artwork.title}</h1>
                            <div className={styles.divider}></div>
                        </div>

                        {}
                        <div className={styles.metaGrid}>
                            <div className={styles.metaBox}>
                                <span className={styles.metaLabel}>ARTIST</span>
                                <Link href={`/artists/${encodeURIComponent(artwork.artist_name || 'unknown')}`} className={styles.artistProfileLink}>
                                    <div className={styles.artistAvatar} style={{ backgroundColor: '#E9C349' }}>
                                        {artwork.artist_name ? artwork.artist_name.charAt(0).toUpperCase() : 'A'}
                                    </div>
                                    <span className={styles.artistName}>{artwork.artist_name}</span>
                                </Link>
                            </div>

                            <div className={styles.metaBox}>
                                <span className={styles.metaLabel}>CATEGORY</span>
                                <span className={styles.categoryValue}>{artwork.category}</span>
                            </div>

                            {}
                            <div className={styles.metaBox}>
                                <span className={styles.metaLabel}>DIMENSIONS</span>
                                <span className={styles.metaValue}>{artwork.dimension || 'N/A'}</span>
                            </div>

                            {}
                            <div className={styles.metaBox}>
                                <span className={styles.metaLabel}>MEDIUM / TOOLS</span>
                                <span className={styles.metaValue}>{artwork.medium || 'N/A'}</span>
                            </div>
                        </div>

                        {artwork.artist_note && (
                            <div className={styles.storySection}>
                                <h3 className={styles.storyTitle}>Artist's Note & Story</h3>
                                <p className={styles.storyText}>{artwork.artist_note}</p>
                            </div>
                        )}

                        <div className={styles.actionBlock}>
                            {collectStatus.text && (
                                <p className={`${styles.statusFeedback} ${collectStatus.isError ? styles.errText : styles.successText}`}>{collectStatus.text}</p>
                            )}
                            <button onClick={handleToggleCollect} disabled={collecting} className={`${styles.collectBtn} ${isCollected ? styles.collectedActive : ''}`}>
                                <span className={styles.collectBtnText}>
                                    {collecting ? 'Processing...' : isCollected ? '✓ Collected' : 'Collect Artwork'}
                                </span>
                            </button>
                        </div>
                    </aside>
                </main>

                {/* 💬 ডিসকাশন ও কমেন্ট এরিয়া */}
                <section className={styles.commentSectionWrapper}>
                    <div className={styles.commentHeader}>
                        <h2>Discussions ({comments.length})</h2>
                    </div>

                    <form onSubmit={handlePostComment} className={styles.commentForm}>
                        <textarea
                            placeholder="Share your thoughts on this masterpiece..."
                            value={mainCommentText}
                            onChange={(e) => setMainCommentText(e.target.value)}
                            className={styles.commentInput}
                            rows={3}
                        />
                        <button type="submit" className={styles.submitCommentBtn}>Post Comment</button>
                    </form>

                    <div className={styles.commentsContainer}>
                        {comments.map((comment) => (
                            <div key={comment._id} className={styles.commentBox}>
                                <div className={styles.commentMainInfo}>
                                    <div>
                                        <Link href={getUserProfileLink(comment.userRole, comment.userName)} className={styles.commenterName}>
                                            {comment.userName} <span className={styles.roleBadge}>{comment.userRole}</span>
                                        </Link>
                                        <p className={styles.commentText}>{comment.text}</p>
                                    </div>

                                    {currentUserId && artwork.artistId && currentUserId.toString() === artwork.artistId.toString() && (
                                        <button onClick={() => handleDeleteComment(comment._id)} className={styles.commentDeleteBtn}>
                                            Delete
                                        </button>
                                    )}
                                </div>

                                <div className={styles.commentActions}>
                                    <button onClick={() => setActiveReplyBox(activeReplyBox === comment._id ? null : comment._id)} className={styles.replyToggleBtn}>
                                        Reply
                                    </button>
                                </div>

                                {activeReplyBox === comment._id && (
                                    <div className={styles.replyInputForm}>
                                        <input
                                            type="text"
                                            placeholder="Write a reply..."
                                            value={replyTextMap[comment._id] || ""}
                                            onChange={(e) => setReplyTextMap({ ...replyTextMap, [comment._id]: e.target.value })}
                                            className={styles.replyInputField}
                                        />
                                        <button onClick={() => handlePostReply(comment._id)} className={styles.replySubmitBtn}>Reply</button>
                                    </div>
                                )}

                                {/* নেস্টেড রিপ্লাই রেন্ডারিং */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className={styles.repliesWrapper}>
                                        {comment.replies.map((reply) => (
                                            <div key={reply._id} className={styles.replyBox}>
                                                <Link href={getUserProfileLink(reply.userRole, reply.userName)} className={styles.replyerName}>
                                                    {reply.userName} <span className={styles.roleBadgeSmall}>{reply.userRole}</span>
                                                </Link>
                                                <p className={styles.replyText}>{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}