'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send, Settings, Globe, ScrollText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/admin/TiptapEditor'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-[#111] animate-pulse rounded-2xl border border-[#1a1a1a]" />
});

export default function NewEditorialPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        author: 'Nathan Reardon',
        category: 'editorial',
        content: '',
        publishedDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (!formData.title) return;

        const generatedSlug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }, [formData.title]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            alert('Please fill in both title and content');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            if (imageFile) {
                data.append('image', imageFile);
            }

            const response = await fetch('/api/admin/posts', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save editorial');
            }

            router.push('/admin/editorials');
            router.refresh();
        } catch (error) {
            console.error('Editorial submission failed:', error);
            alert(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }} className="space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-6" style={{ position: 'sticky', top: 0, backdropFilter: 'blur(16px)', backgroundColor: 'rgba(5, 5, 5, 0.9)', zIndex: 20, paddingTop: '1rem' }}>
                <div className="flex items-center gap-4">
                    <Link href="/admin/editorials" className="btn-icon">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight oswald" style={{ marginBottom: '0.25rem' }}>CREATE EDITORIAL</h1>
                        <p className="text-muted text-sm">Publish official commentary with the dedicated editorial flow.</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary"
                    style={{ padding: '0.875rem 2rem', fontSize: '0.95rem' }}
                >
                    {loading ? <div className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} /> : <Send size={20} />}
                    {loading ? 'Publishing...' : 'Publish Editorial'}
                </button>
            </div>

            <form className="grid gap-8" style={{ gridTemplateColumns: '1fr 340px' }}>
                <div className="space-y-6">
                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Your editorial headline..."
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
                            onChange={(newContent) => setFormData(prev => ({ ...prev, content: newContent }))}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border-all rounded-2xl p-6 shadow-xl space-y-6" style={{ position: 'sticky', top: '120px' }}>
                        <div>
                            <h3 className="oswald" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '1.5rem', letterSpacing: '0.15rem' }}>
                                <Settings size={18} style={{ display: 'inline-block', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                EDITORIAL METADATA
                            </h3>
                        </div>

                        <div className="rounded-2xl border-all bg-muted p-4 space-y-2">
                            <div className="flex items-center gap-2 text-white font-semibold">
                                <ScrollText size={16} className="text-accent" />
                                <span>Category locked</span>
                            </div>
                            <p className="text-dim text-sm m-0">This flow always publishes to the public `Editorial` section.</p>
                        </div>

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

                        <div>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>URL Slug</span>
                                <Globe size={12} style={{ color: 'var(--accent)' }} />
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '0.75rem',
                                    padding: '0.875rem 1rem',
                                    color: 'var(--text-dim)',
                                    fontSize: '0.85rem',
                                    fontFamily: 'monospace',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Featured Image</label>
                            <div
                                className="relative overflow-hidden flex items-center justify-center"
                                style={{
                                    aspectRatio: '16 / 9',
                                    backgroundColor: 'var(--bg-muted)',
                                    border: '1px dashed var(--border-color)',
                                    borderRadius: '1rem',
                                }}
                            >
                                {previewImage ? (
                                    <Image src={previewImage} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="text-dim text-sm">No image selected</div>
                                )}
                            </div>
                            <label className="btn-secondary mt-3" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                                Upload Featured Image
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
