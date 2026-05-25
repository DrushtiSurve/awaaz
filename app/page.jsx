'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const COLORS = [
  { bg: '#FFF0F5', name: '#5C0F26', by: '#C4648A', date: '#D98FAA', desc: '#7A3050', locBg: '#FAD4E3', locText: '#7D1A3A', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#F5F2FF', name: '#2A0F5C', by: '#8A74C8', date: '#A894D8', desc: '#503A8A', locBg: '#E4D8FA', locText: '#3A1A7D', typeBg: '#FCE8F0', typeText: '#8A1A4A' },
  { bg: '#FFF8F5', name: '#5C1A0A', by: '#C48A78', date: '#D8A898', desc: '#7A4838', locBg: '#F5E0D4', locText: '#8C3A28', typeBg: '#F5E8F0', typeText: '#8C3A70' },
  { bg: '#FFF5F0', name: '#5C1008', by: '#C4604A', date: '#D8907A', desc: '#7A3828', locBg: '#FAE0D8', locText: '#8C2010', typeBg: '#EEF0FA', typeText: '#4A4FA8' },
  { bg: '#F2FAF6', name: '#0A3D22', by: '#4A9A6A', date: '#7ABA98', desc: '#2A5C3A', locBg: '#D4F0E4', locText: '#1A6A3A', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#FFF8E8', name: '#4A2E00', by: '#7A5020', date: '#9A6A30', desc: '#6A4818', locBg: '#FAE8C0', locText: '#7A4A00', typeBg: '#F5E8F0', typeText: '#8C3A70' },
  { bg: '#F0F8FF', name: '#0A2A5C', by: '#2A5A9A', date: '#4A7AC8', desc: '#2A4A8A', locBg: '#C8E4FA', locText: '#0A3A7A', typeBg: '#FCE8F0', typeText: '#8A1A4A' },
  { bg: '#FFF0FA', name: '#5C0A40', by: '#8A2A6A', date: '#BA3A8A', desc: '#7A2A5A', locBg: '#F5C8E8', locText: '#7A1A5A', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#F5FFF8', name: '#0A3A1A', by: '#2A6A3A', date: '#4A9A5A', desc: '#1A5A2A', locBg: '#C8ECD4', locText: '#0A4A1A', typeBg: '#F5E0D4', typeText: '#8C3A28' },
  { bg: '#FFF5F5', name: '#5C0A0A', by: '#8A2020', date: '#BA3030', desc: '#7A2020', locBg: '#FAC8C8', locText: '#7A0A0A', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#F8F5FF', name: '#2A0A5C', by: '#4A2A8A', date: '#6A4ABA', desc: '#3A2A6A', locBg: '#DCD4FA', locText: '#3A0A7A', typeBg: '#FCE8F0', typeText: '#8A1A4A' },
  { bg: '#FFFAF0', name: '#4A3000', by: '#7A5818', date: '#9A7828', desc: '#6A4810', locBg: '#FAE8B0', locText: '#6A4000', typeBg: '#F5E8F0', typeText: '#8C3A70' },
  { bg: '#F0FFFC', name: '#0A3A30', by: '#1A6A5A', date: '#3A9A7A', desc: '#1A5A4A', locBg: '#C0EDE4', locText: '#0A4A38', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#FFF0F8', name: '#5C0A30', by: '#8A1A50', date: '#BA2A70', desc: '#7A1A40', locBg: '#F5C0DC', locText: '#7A0A40', typeBg: '#E4D8FA', typeText: '#3A1A7D' },
  { bg: '#F8FFF0', name: '#1A3A0A', by: '#2A6A10', date: '#4A9A20', desc: '#1A5A0A', locBg: '#D8F0B0', locText: '#1A4A0A', typeBg: '#FAD4E3', typeText: '#7D1A3A' },
  { bg: '#FFF8F0', name: '#4A1A00', by: '#7A3A10', date: '#9A5A20', desc: '#6A3008', locBg: '#FAE0C0', locText: '#6A2A00', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#F5F0FF', name: '#2A0A4A', by: '#4A2A7A', date: '#6A4AAA', desc: '#3A1A6A', locBg: '#DCC8F5', locText: '#3A0A6A', typeBg: '#FCE8F0', typeText: '#8A1A4A' },
  { bg: '#F0FFF8', name: '#0A3A28', by: '#1A6A48', date: '#3A9A68', desc: '#1A5A38', locBg: '#B8ECD8', locText: '#0A4A30', typeBg: '#F5E0D4', typeText: '#8C3A28' },
  { bg: '#FFF0ED', name: '#4A100A', by: '#7A2818', date: '#9A4828', desc: '#6A2010', locBg: '#F5D0C4', locText: '#6A1A0A', typeBg: '#EDE8FA', typeText: '#4A3AA8' },
  { bg: '#F8F0FF', name: '#380A5C', by: '#602A8A', date: '#8A4ABA', desc: '#4A2A7A', locBg: '#E8C8FA', locText: '#500A7A', typeBg: '#FCE8F0', typeText: '#8A1A4A' },
];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    loadInitialPosts();
  }, []);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
      const unsub = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
      });
      return () => unsub();
    }, []);

  const loadInitialPosts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc, idx) => ({
        id: doc.id,
        ...doc.data(),
        colorIndex: idx % COLORS.length,
      }));
      setPosts(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
    setLoading(false);
  };

  const loadMorePosts = async () => {
    if (!lastDoc) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc, idx) => ({
        id: doc.id,
        ...doc.data(),
        colorIndex: (posts.length + idx) % COLORS.length,
      }));
      setPosts([...posts, ...data]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
    setLoading(false);
  };

      const handleLogout = async () => {

      const confirmLogout = window.confirm(
        'Are you sure you want to logout?'
      );

      if (!confirmLogout) return;

      try {
        await signOut(auth);
        setCurrentUser(null);
      } catch (err) {
        console.error('Logout failed:', err);
      }
    };

    const filteredPosts = posts
      .filter((post) => {
        const matchesSearch =
          post.abuserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.state?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
          filterType === 'all' || post.abuseType === filterType;

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // ✅ Your posts first
        if (currentUser) {
          if (a.userId === currentUser.uid && b.userId !== currentUser.uid) return -1;
          if (a.userId !== currentUser.uid && b.userId === currentUser.uid) return 1;
        }

        // ✅ fallback → newest first
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      });
      const getColor = (colorIndex) => COLORS[colorIndex % COLORS.length];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{ background: '#FAF7F2', borderBottom: '0.5px solid #E8E0D5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 500, color: '#7A3F2B', lineHeight: 1.1 }}>awaaz</div>
          <div style={{ fontSize: '15px', color: '#B09080', letterSpacing: '0.2px' }}>your voice deserves to be heard</div>
        </div>
       <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>

        <button
          onClick={() => {
            if (currentUser) {
              router.push('/choose-category');
            } else {
              router.push('/signup');
            }
          }}
          style={{
            background: '#7A3F2B',
            color: '#FAF7F2',
            border: 'none',
            borderRadius: '20px',
            padding: '6px 16px',
            fontSize: '15px',
            fontFamily: 'inherit',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          
          share your story
        </button>

        {currentUser && (
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: '#7A3F2B',
              border: '0.5px solid #7A3F2B',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '15px',
              cursor: 'pointer',
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
            logout
          </button>
        )}

      </div>
      </nav>

      
      {/* Hero */}
      <div style={{ padding: '2.5rem 2rem 1.5rem', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '22px', fontWeight: 500, color: '#3D2216', marginBottom: '0.5rem' }}>
          a safe space to speak up
        </div>
        <div style={{ fontSize: '14px', color: '#8C6B5A', lineHeight: 1.6, maxWidth: '480px' }}>
          This is a space for women, men and everyone to share their experiences. Anonymously or by name. You are believed here.
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ padding: '0 2rem 1.5rem', maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="search by name, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            background: '#FFF8F3',
            border: '0.5px solid #DDD0C4',
            borderRadius: '24px',
            padding: '9px 18px',
            fontSize: '14px',
            color: '#3D2216',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'workplace', 'domestic', 'public space', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? '#7A3F2B' : '#FFF8F3',
                color: filterType === type ? '#FAF7F2' : '#8C6B5A',
                border: `0.5px solid ${filterType === type ? '#7A3F2B' : '#DDD0C4'}`,
                borderRadius: '16px',
                padding: '5px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
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
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Post count */}
      <div style={{ fontSize: '12px', color: '#C4A898', padding: '0.5rem 2rem', maxWidth: '680px', margin: '0 auto' }}>
        showing {filteredPosts.length} {filteredPosts.length === 1 ? 'story' : 'stories'}
      </div>

      {/* Feed */}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && posts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#B09080', padding: '2rem' }}>loading stories...</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#B09080', padding: '2rem' }}>no stories match your search</div>
        ) : (
          filteredPosts.map((post) => {
            const color = getColor(post.colorIndex);
            return (
            <div
            key={post.id}
            onClick={() => setSelectedPost(post)} // ✅ opens modal instead of redirect
            style={{
              background: color.bg,
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              border: '0.5px solid rgba(0,0,0,0.07)',
              cursor: 'pointer',
            }}
          >
              
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: color.name }}>
                      {post.abuserName}
                    </div>
                    <div style={{ fontSize: '12px', color: color.by }}>
                      {post.isAnonymous ? 'shared anonymously' : `shared by ${post.posterName}`}
                    </div>
                  </div>
              {currentUser && post.userId === currentUser.uid && (
                  <button
              onClick={(e) => {
                e.stopPropagation(); // ✅ prevents opening modal
                router.push(`/edit/${post.id}`); // ✅ go to edit page
              }}                  style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '0.5px solid #7A3F2B',
                      background: 'transparent',
                      color: '#7A3F2B',
                      cursor: 'pointer',
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
                    edit
                  </button>
                )}


                  <div style={{ fontSize: '11px', color: color.date, whiteSpace: 'nowrap' }}>
                    {post.createdAt?.toDate?.().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '7px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, background: color.locBg, color: color.locText }}>
                    {post.city}, {post.state}
                  </span>
                  <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '10px', fontWeight: 500, background: color.typeBg, color: color.typeText }}>
                    {post.abuseType}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: color.desc, lineHeight: 1.65, wordBreak:'break-word', overflowWrap:'break-word', }}>
                {post.description.length > 300 
                  ? post.description.substring(0, 300) + '...'
                  : post.description
                }                
              </div>
              </div>
            );
          })
        )}
      </div>
          {selectedPost && (
            <div
              onClick={() => setSelectedPost(null)} // ✅ close modal
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
              }}
            >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#FFFCF9',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
      }}
    >
      {/* CLOSE */}
      <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
        <button
          onClick={() => setSelectedPost(null)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          ✕
        </button>
      </div>

          {/* TITLE */}
          <h2 style={{ textAlign: 'center',color: '#8C6B5A',fontSize: 20 }}>
            {selectedPost.abuserName}
          </h2>

          {/* AUTHOR */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#8C6B5A',fontSize: 15 }}>
            {selectedPost.isAnonymous
              ? 'shared anonymously'
              : `shared by ${selectedPost.posterName || 'Anonymous'}`}
          </div>

          {/* META */}
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#8C6B5A', marginBottom: '1rem',fontSize: 15 }}>
            {selectedPost.city}, {selectedPost.state} • {selectedPost.abuseType}
          </div>

          {/* STORY */}
          <div
            style={{
              lineHeight: 1.9,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 15,
              color:'black',
            }}
          >
            {selectedPost.description}
          </div>

          {/* IMAGE */}
          {selectedPost.imageUrl && (
            <img
              src={selectedPost.imageUrl}
              style={{ width: '100%', marginTop: '1rem', borderRadius: '10px' }}
            />
          )}
        </div>
      </div>
    )}
      {/* Load More Button */}
      {hasMore && filteredPosts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <button
            onClick={loadMorePosts}
            disabled={loading}
            style={{
              background: '#7A3F2B',
              color: '#FAF7F2',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 24px',
              fontSize: '13px',
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'loading...' : 'load more stories'}
          </button>
        </div>
      )}
    </div>
  );
}