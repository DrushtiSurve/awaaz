'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to category selection page
      router.push('/choose-category');
    } catch (err) {
      console.error('Error logging in:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ background: '#FAF7F2', borderBottom: '0.5px solid #E8E0D5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <div style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '30px', fontWeight: 500, color: '#7A3F2B', lineHeight: 1.1 }}>awaaz</div>
            <div style={{ fontSize: '15px', color: '#B09080', letterSpacing: '0.2px' }}>your voice deserves to be heard</div>
          </div>
        </Link>
        <Link href="/">
          <button style={{ background: '#7A3F2B', color: '#FAF7F2', border: 'none', borderRadius: '20px', padding: '6px 16px', fontSize: '15px', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>
            back to stories
          </button>
        </Link>
      </nav>

      {/* Login Form */}
      <div style={{ maxWidth: '500px', margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ background: '#FFFCF9', border: '0.5px solid #E8E0D5', borderRadius: '14px', padding: '2rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#3D2216', marginBottom: '0.5rem' }}>welcome back</h2>
          <p style={{ fontSize: '13px', color: '#8C6B5A', marginBottom: '1.5rem' }}>log in to share your story</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                email
              </label>
              <input
                type="email"
                placeholder="your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid #DDD0C4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  color: '#000',
                  backgroundColor: '#fff',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                password
              </label>
              <input
                type="password"
                placeholder="your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '0.5px solid #DDD0C4',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  color: '#000',
                  backgroundColor: '#fff',
                }}
              />
            </div>

            {/* Error Message */}
            {error && <div style={{ color: '#C85A3A', fontSize: '12px', marginBottom: '1rem', backgroundColor: '#FFF5F0', padding: '10px', borderRadius: '6px' }}>{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: '#7A3F2B',
                color: '#FAF7F2',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
                marginBottom: '1rem',
              }}
            >
              {loading ? 'logging in...' : 'log in'}
            </button>
          </form>

          {/* Link to Signup */}
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#8C6B5A' }}>
            don't have an account?{' '}
            <Link href="/signup" style={{ color: '#7A3F2B', fontWeight: 500, textDecoration: 'none' }}>
              create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}