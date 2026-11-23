'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CalendarClock, ChevronLeft, Send, Settings, Globe, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Import Tiptap dynamically to avoid SSR issues
const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-[#111] animate-pulse rounded-2xl border border-[#1a1a1a]" />
});

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        author: 'Staff',
        category: 'local',
        content: '',
        publishedDate: new Date().toISOString().split('T')[0],
        isHeadline: false,
        headlineUntil: '',
    });

    useEffect(() => {
        const fetchPost = async () => {
            if (!params.id) return;
            try {
                const res = await fetch(`/api/admin/posts/${params.id}`);
                if (res.ok) {
                    const post = await res.json();
                    setFormData({
                        title: post.title,
                        slug: post.slug,
                        author: post.author,
                        category: post.category,
                        content: post.content,
                        publishedDate: new Date(post.publishedDate).toISOString().split('T')[0],
                        isHeadline: post.isHeadline ?? false,
                        headlineUntil: post.headlineUntil ? new Date(post.headlineUntil).toISOString().slice(0, 16) : '',
                    });
                    if (post.image) {
                        setPreviewImage(post.image);
                    }
                } else {
                    alert('Post not found');
                    router.push('/admin/posts');
                }
            } catch (error) {
                console.error('Fetch post error:', error);
                alert('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id, router]);

    const handleContentChange = (newContent: string) => {
        setFormData(prev => ({ ...prev, content: newContent }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Please fill in both title and content');
            return;
        }

        setSaving(true);

        try {
            const updateRes = await fetch(`/api/admin/posts/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    ...formData,
                    image: previewImage?.startsWith('http') ? previewImage : undefined,
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (updateRes.ok) {
                router.push('/admin/posts');
                router.refresh();
            } else {
                alert('Failed to update post');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <Loader2 size={48} className="text-accent animate-spin" />
                <p className="text-dim">Loading story...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6" style={{ position: 'sticky', top: 0, backdropFilter: 'blur(16px)', backgroundColor: 'rgba(5, 5, 5, 0.9)', zIndex: 20, paddingTop: '1rem' }}>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/posts"
                        className="btn-icon"
                    >
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight oswald" style={{ marginBottom: '0.25rem' }}>EDIT EXCLUSIVE</h1>
                        <p className="text-muted text-sm">Update your editorial content • Author: {formData.author}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn-primary"
                        style={{ padding: '0.875rem 2rem', fontSize: '0.95rem' }}
                    >
                        {saving ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                        {saving ? 'Saving...' : 'Update Story'}
                    </button>
                </div>
            </div>

            <form className="grid gap-8" style={{ gridTemplateColumns: '1fr 340px' }}>
                {/* Main Editor Area */}
                <div className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Your story headline..."
                                className="oswald"
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '3.5rem',
                                    fontWeight: 700,
                                    color: '#fff',
                                    outline: 'none',
                                    lineHeight: 1.1,
                                    textTransform: 'uppercase',
                                    letterSpacing: '-0.02em'
                                }}
                                required
                            />
                            <div style={{ height: '2px', background: 'linear-gradient(to right, var(--accent), transparent)', marginTop: '1rem', opacity: 0.3 }} />
                        </div>

                        <TiptapEditor
                            content={formData.content}
                            onChange={handleContentChange}
                        />
                    </div>
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-6">
                    <div className="bg-card border-all rounded-2xl p-6 shadow-xl space-y-6" style={{ position: 'sticky', top: '120px' }}>
                        <div>
                            <h3 className="oswald" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '1.5rem', letterSpacing: '0.15rem' }}>
                                <Settings size={18} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                POST METADATA
                            </h3>
                        </div>

                        {/* Author */}
                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Author</label>
                            <select
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                <option value="Nathan Reardon">Nathan Reardon</option>
                                <option value="Maine News Now">Maine News Now</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                }}
                            >
                                <option value="local">Local News</option>
                                <option value="politics">Politics</option>
                                <option value="opinion">Opinion</option>
                                <option value="editorial">Editorial</option>
                                <option value="weather">Weather</option>
                                <option value="exclusives">Exclusives</option>
                            </select>
                        </div>

                        {/* Slug */}
                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>URL Slug</span>
                                <Globe size={12} style={{ color: 'var(--accent)' }} />
                            </label>
                            <input
                                type="text"
                                disabled
                                value={formData.slug}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    cursor: 'not-allowed',
                                    opacity: 0.5
                                }}
                            />
                        </div>

                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <label style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.isHeadline}
                                    onChange={(event) => {
                                        const isHeadline = event.target.checked;
                                        setFormData((current) => ({
                                            ...current,
                                            isHeadline,
                                            headlineUntil: isHeadline && !current.headlineUntil
                                                ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                                                : current.headlineUntil,
                                        }));
                                    }}
                                    style={{ marginTop: '0.25rem', width: '1rem', height: '1rem', accentColor: 'var(--accent)' }}
                                />
                                <span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontWeight: 700 }}>
                                        <CalendarClock size={16} style={{ color: 'var(--accent)' }} />
                                        Homepage headline
                                    </span>
                                    <span style={{ display: 'block', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.45 }}>
                                        Keep this story at the top of the homepage until the time below.
                                    </span>
                                </span>
                            </label>
                            <div style={{ marginTop: '0.9rem' }}>
                                <label htmlFor="headlineUntil" style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', fontSize: '0.8rem' }}>
                                    Headline expires
                                </label>
                                <input
                                    id="headlineUntil"
                                    type="datetime-local"
                                    value={formData.headlineUntil}
                                    min={new Date().toISOString().slice(0, 16)}
                                    disabled={!formData.isHeadline}
                                    required={formData.isHeadline}
                                    onChange={(event) => setFormData({ ...formData, headlineUntil: event.target.value })}
                                    style={{ width: '100%', backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-color)', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: formData.isHeadline ? '#fff' : 'var(--text-muted)', fontSize: '0.9rem', outline: 'none', opacity: formData.isHeadline ? 1 : 0.55, cursor: formData.isHeadline ? 'text' : 'not-allowed' }}
                                />
                            </div>
                        </div>

                        {/* Image Upload Placeholder */}
                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Featured Image</label>
                            <div
                                style={{
                                    aspectRatio: '16 / 9',
                                    borderRadius: '1rem',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-muted)',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}
                            >
                                {previewImage && (
                                    <Image src={previewImage} alt="Preview" fill className="object-cover" unoptimized />
                                )}
                            </div>
                            <p className="text-[10px] text-dim mt-2 italic">Image editing not supported in this version. Delete and recreate if image change is required.</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
