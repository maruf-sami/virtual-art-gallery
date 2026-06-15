'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function AuthPage() {
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(false);
    const [role, setRole] = useState('visitor');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [message, setMessage] = useState({
        text: '',
        isError: false,
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const clearForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
        });
    };

    const handleAuthModeChange = (loginMode) => {
        setIsLogin(loginMode);
        setMessage({
            text: '',
            isError: false,
        });
        clearForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);

        setMessage({
            text: '',
            isError: false,
        });

        if (!isLogin && formData.name.trim().length < 3) {
            setMessage({
                text: 'Name must be at least 3 characters',
                isError: true,
            });

            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            setMessage({
                text: 'Please enter a valid email address',
                isError: true,
            });

            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setMessage({
                text: 'Password must be at least 8 characters',
                isError: true,
            });

            setLoading(false);
            return;
        }

        const payload = isLogin
            ? {
                action: 'login',
                email: formData.email.trim(),
                password: formData.password,
            }
            : {
                action: 'signup',
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role,
            };

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({
                    text: data.message,
                    isError: false,
                });

                clearForm();

                setTimeout(() => {
                    
                    window.location.href = '/gallery';
                }, 800);
            } else {
                setMessage({
                    text: data.message || 'Something went wrong',
                    isError: true,
                });
            }
        } catch (error) {
            console.error(error);

            setMessage({
                text: 'Connection error. Please try again.',
                isError: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.canvasWrapper}>
                <div className={styles.authBox}>
                    <div className={styles.header}>
                        <h1 className={styles.logoTitle}>
                            VIRTUAL GALLERY
                        </h1>

                        <p className={styles.subtitle}>
                            {isLogin
                                ? 'Welcome back to the masterpiece haven'
                                : 'Join the elite community of art'}
                        </p>
                    </div>

                    <div className={styles.toggleContainer}>
                        <button
                            type="button"
                            className={`${styles.toggleBtn} ${!isLogin ? styles.activeToggle : ''
                                }`}
                            onClick={() =>
                                handleAuthModeChange(false)
                            }
                        >
                            Sign Up
                        </button>

                        <button
                            type="button"
                            className={`${styles.toggleBtn} ${isLogin ? styles.activeToggle : ''
                                }`}
                            onClick={() =>
                                handleAuthModeChange(true)
                            }
                        >
                            Log In
                        </button>
                    </div>

                    {!isLogin && (
                        <div
                            className={
                                styles.roleToggleContainer
                            }
                        >
                            <button
                                type="button"
                                className={`${styles.roleBtn} ${role === 'user'
                                    ? styles.activeRole
                                    : ''
                                    }`}
                                onClick={() =>
                                    setRole('visitor')
                                }
                            >
                                Register as Viewer
                            </button>

                            <button
                                type="button"
                                className={`${styles.roleBtn} ${role === 'artist'
                                    ? styles.activeRole
                                    : ''
                                    }`}
                                onClick={() =>
                                    setRole('artist')
                                }
                            >
                                Register as Artist
                            </button>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className={styles.form}
                    >
                        {message.text && (
                            <div
                                className={`${styles.messageBox} ${message.isError
                                    ? styles.errorMsg
                                    : styles.successMsg
                                    }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {!isLogin && (
                            <div
                                className={styles.inputGroup}
                            >
                                <label
                                    className={styles.label}
                                >
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    required
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Alex Mercer"
                                    className={styles.input}
                                />
                            </div>
                        )}

                        <div
                            className={styles.inputGroup}
                        >
                            <label className={styles.label}>
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={
                                    handleInputChange
                                }
                                placeholder="alex@example.com"
                                className={styles.input}
                            />
                        </div>

                        <div
                            className={styles.inputGroup}
                        >
                            <label className={styles.label}>
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                required
                                minLength={8}
                                autoComplete={
                                    isLogin
                                        ? 'current-password'
                                        : 'new-password'
                                }
                                value={formData.password}
                                onChange={
                                    handleInputChange
                                }
                                placeholder="••••••••"
                                className={styles.input}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={
                                styles.submitSubmitBtn
                            }
                        >
                            {loading
                                ? 'Processing...'
                                : isLogin
                                    ? 'Access Gallery'
                                    : Register as ${role}}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
