'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';

export default function PostPage() {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'posts', id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setPost(snap.data());
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    if (id) fetchPost();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem' }}>loading...</div>;
  }

  if (!post) {
    return <div style={{ padding: '2rem' }}>post not found</div>;
  }

                return (
                <div
                    style={{
                    background: '#FAF7F2',
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem',
                    }}
                >
                    <div
                    style={{
                        width: '100%',
                        maxWidth: '720px',
                        background: '#FFFCF9',
                        borderRadius: '16px',
                        padding: '2.5rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        border: '0.5px solid #E8E0D5',
                        position: 'relative',
                    }}
                    >
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/')}
                        style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#7A3F2B',
                        fontSize: '13px',
                        cursor: 'pointer',
                        }}
                    >
                        ← back
                    </button>

                    {/* Title */}
                    <h2
                        style={{
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 500,
                        color: '#3D2216',
                        marginBottom: '0.3rem',
                        }}
                    >
                        {post.abuserName}
                    </h2>

                    <div
                    style={{
                        textAlign: 'center',
                        fontSize: '15px',
                        color: '#8C6B5A',
                        marginBottom: '1rem',
                    }}
                    >
                    {post.isAnonymous
                        ? 'shared anonymously'
                        : `shared by ${post.posterName || 'Anonymous'}`}
                    </div>

                    {/* Meta */}
                    <div
                        style={{
                        textAlign: 'center',
                        fontSize: '15px',
                        color: '#B09080',
                        marginBottom: '1.5rem',
                        }}
                    >
                        {post.city}, {post.state} • {post.abuseType}
                    </div>

                    {/* Divider */}
                    <div
                        style={{
                        height: '1px',
                        background: '#E8E0D5',
                        margin: '1rem 0 1.5rem',
                        }}
                    />

                    {/* Story (DIARY TEXT STYLE) */}
                    <div
                    style={{
                        fontSize: '15px',
                        lineHeight: 1.9,
                        color: '#3D2216',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'justify',
                        letterSpacing: '0.2px',

                        wordBreak: 'break-word',      // ✅ FIX
                        overflowWrap: 'break-word',   // ✅ FIX
                    }}
                    >
                    {post.description}
                    </div>

                    {/* Optional Image */}
                    {post.imageUrl && (
                        <div style={{ marginTop: '2rem' }}>
                        <img
                            src={post.imageUrl}
                            alt="evidence"
                            style={{
                            width: '100%',
                            borderRadius: '10px',
                            border: '0.5px solid #E8E0D5',
                            }}
                        />
                        </div>
                    )}
                    </div>
                </div>
);
}