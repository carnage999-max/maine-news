import React from 'react';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { Plus, ScrollText, Calendar, User, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import PostActions from '@/components/admin/PostActions';

export const dynamic = 'force-dynamic';

export default async function EditorialsListPage() {
    const editorials = await db.query.posts.findMany({
        where: eq(posts.category, 'editorial'),
        orderBy: [desc(posts.publishedDate)],
        columns: {
            id: true,
            title: true,
            image: true,
            category: true,
            author: true,
            publishedDate: true,
            slug: true,
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col justify-between gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Editorials</h1>
                    <p className="text-dim mt-1">Manage official editorials and institutional commentary.</p>
                </div>
                <Link
                    href="/admin/editorials/new"
                    className="btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Plus size={20} />
                    Create Editorial
                </Link>
            </div>

            <div className="grid gap-4">
                {editorials.length > 0 ? (
                    editorials.map((post) => (
                        <div
                            key={post.id}
                            className="bg-card border-all hover-accent-border rounded-2xl p-4 flex gap-6 transition-all"
                        >
                            <div className="aspect-video rounded-xl bg-dim overflow-hidden relative" style={{ width: '200px', flexShrink: 0 }}>
                                {post.image ? (
                                    <Image src={post.image} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <ScrollText size={32} style={{ color: '#333' }} />
                                    </div>
                                )}
                                <div className="absolute" style={{ top: '0.5rem', left: '0.5rem', padding: '0.25rem 0.5rem', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', color: '#bf9b30', textTransform: 'uppercase' }}>
                                    Editorial
                                </div>
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-white mb-0" style={{ margin: 0 }}>
                                        {post.title}
                                    </h2>
                                    <PostActions postId={post.id} />
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-dim">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-accent" />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-accent" />
                                        <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
                                        <Link
                                            href={`/article/${post.slug}`}
                                            target="_blank"
                                            className="text-accent"
                                            style={{ textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
                                        >
                                            <ExternalLink size={14} />
                                            Live Link
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <div className="p-6 bg-dim rounded-full mb-4">
                            <ScrollText size={48} style={{ color: '#333' }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No editorials yet</h3>
                        <p className="text-dim mb-8 text-center max-w-sm">Create a dedicated editorial here instead of burying it in the general post flow.</p>
                        <Link
                            href="/admin/editorials/new"
                            className="px-8 py-3 bg-dim text-white rounded-xl border-all hover-white"
                            style={{ textDecoration: 'none' }}
                        >
                            Write Editorial
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
