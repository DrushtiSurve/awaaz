'use client';

import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (!gender) {
        setError('Please select your gender');
        setLoading(false);
        return;
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user profile to Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        email: email,
        displayName: displayName || null,
        gender: gender,
        createdAt: new Date(),
      });

      // Redirect to submit post page
      router.push('/choose-category');    } catch (err) {
      console.error('Error signing up:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message);
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

      {/* Signup Form */}
      <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: '#FFFCF9', border: '0.5px solid #E8E0D5', borderRadius: '14px', padding: '2rem' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#3D2216', marginBottom: '0.5rem' }}>create your account</h2>
          <p style={{ fontSize: '13px', color: '#8C6B5A', marginBottom: '1.5rem' }}>join awaaz and share your story safely</p>

          <form onSubmit={handleSignup}>
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
                placeholder="at least 6 characters"
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

            {/* Confirm Password */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                confirm password
              </label>
              <input
                type="password"
                placeholder="confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Gender */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.75rem' }}>
                gender
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['female','male','prefer not to say'].map((option) => (
                  <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="gender"
                      value={option}
                      checked={gender === option}
                      onChange={(e) => setGender(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#3D2216', textTransform: 'capitalize' }}>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Display Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '12px', color: '#7A3F2B', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                your name (optional)
              </label>
              <input
                type="text"
                placeholder="leave blank to stay anonymous"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
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
              }}
            >
              {loading ? 'creating account...' : 'create account'}
            </button>
            {/* Link to Login */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            
            <div style={{ fontSize: '13px', color: '#8C6B5A', marginBottom: '8px' }}>
              already have an account?
            </div>

            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'transparent',
                  color: '#7A3F2B',
                  border: '1px solid #7A3F2B',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#7A3F2B';
                  e.target.style.color = '#FAF7F2';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#7A3F2B';
                }}
              >
                log in
              </button>
            </Link>

          </div>
          </form>
        </div>
      </div>
    </div>
  );
}