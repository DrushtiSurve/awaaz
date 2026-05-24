'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChooseCategoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/signup');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleCategorySelect = (category) => {
    router.push('/submit/cyber')  };

  if (loading) {
    return (
      <div style={{ background: '#FAF7F2', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#B09080', fontSize: '14px' }}>loading...</div>
      </div>
    );
  }

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

      {/* Category Selection */}
      <div style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 500, color: '#3D2216', marginBottom: '0.5rem' }}>
            what type of abuse do you want to share?
          </h2>
          <p style={{ fontSize: '14px', color: '#8C6B5A', lineHeight: 1.6 }}>
            choose the category that best describes your experience
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* Physical Category */}
          <button
            onClick={() => handleCategorySelect('physical')}
            style={{
              background: '#FFFCF9',
              border: '0.5px solid #E8E0D5',
              borderRadius: '14px',
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7A3F2B';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E8E0D5';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#3D2216', marginBottom: '0.75rem' }}>
              physical
            </div>
            <div style={{ fontSize: '12px', color: '#8C6B5A', lineHeight: 1.6 }}>
              this includes all kinds of physical harassment — workplace, domestic, public space, stalking, physical assault, sexual harassment, etc.
            </div>
          </button>

          {/* Cyber Crime Category */}
          <button
            onClick={() => handleCategorySelect('cyber')}
            style={{
              background: '#FFFCF9',
              border: '0.5px solid #E8E0D5',
              borderRadius: '14px',
              padding: '2rem 1.5rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7A3F2B';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E8E0D5';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#3D2216', marginBottom: '0.75rem' }}>
              cyber crime
            </div>
            <div style={{ fontSize: '12px', color: '#8C6B5A', lineHeight: 1.6 }}>
              rape threats or any kind of verbal harassment on social media, Instagram DMs, WhatsApp, emails, online abuse, etc.
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}