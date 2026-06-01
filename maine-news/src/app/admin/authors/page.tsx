import React from 'react';
import { desc } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, Plus, User, Users } from 'lucide-react';
import { db } from '@/db';
import { authors } from '@/db/schema';
import AuthorRowActions from '@/components/admin/AuthorRowActions';

export const dynamic = 'force-dynamic';

export default async function AuthorsListPage() {
    const allAuthors = await db.query.authors.findMany({
        orderBy: [desc(authors.createdAt)],
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col justify-between gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Newsroom Profiles</h1>
                    <p className="text-dim mt-1">Manage reporters and contributors shown on the public site.</p>
                </div>
                <Link
                    href="/admin/authors/new"
                    className="btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                >
                    <Plus size={20} />
                    Add Profile
                </Link>
            </div>

            <div className="grid gap-4">
                {allAuthors.length > 0 ? (
                    allAuthors.map((author) => (
                        <div
                            key={author.id}
                            className="bg-card border-all hover-accent-border rounded-2xl p-5 flex flex-col gap-5 transition-all md:flex-row"
                        >
                            <div className="h-20 w-20 rounded-2xl bg-dim overflow-hidden relative flex-shrink-0">
                                {author.avatar ? (
                                    <Image src={author.avatar} alt={author.name} fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center">
                                        <User size={32} style={{ color: '#333' }} />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-2">
                                        <div>
                                            <h2 className="text-xl font-bold text-white" style={{ margin: 0 }}>
                                                {author.name}
                                            </h2>
                                            <p className="text-sm text-accent">{author.role || 'Reporter'}</p>
                                        </div>
                                        <p className="text-sm text-dim max-w-2xl">{author.bio || 'No bio provided yet.'}</p>
                                        <div className="flex flex-col gap-1 text-xs text-dim">
                                            {author.email && (
                                                <span className="inline-flex items-center gap-2">
                                                    <Mail size={14} />
                                                    {author.email}
                                                </span>
                                            )}
                                            {author.contactInfo && (
                                                <span className="inline-flex items-center gap-2">
                                                    <Phone size={14} />
                                                    {author.contactInfo}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <AuthorRowActions authorId={author.id} authorName={author.name} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <div className="p-6 bg-dim rounded-full mb-4">
                            <Users size={48} style={{ color: '#333' }} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No profiles found</h3>
                        <p className="text-dim mb-8 text-center max-w-sm">Add newsroom profiles for your reporters and contributors from here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
