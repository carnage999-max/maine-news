import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/db';
import { authors } from '@/db/schema';
import AuthorForm from '@/components/admin/AuthorForm';

export const dynamic = 'force-dynamic';

export default async function EditAuthorPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const author = await db.query.authors.findFirst({
        where: eq(authors.id, id),
    });

    if (!author) {
        return (
            <div className="space-y-8 animate-in fade-in">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/authors"
                        className="p-2 bg-dim rounded-xl border-all text-dim hover-white transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Profile Not Found</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/authors"
                    className="p-2 bg-dim rounded-xl border-all text-dim hover-white transition-all"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Edit Profile</h1>
                    <p className="text-dim mt-1">Update newsroom bio, photo, and contact details.</p>
                </div>
            </div>

            <AuthorForm
                authorId={author.id}
                isEditing
                initialData={{
                    name: author.name,
                    role: author.role,
                    avatar: author.avatar,
                    bio: author.bio,
                    email: author.email,
                    contactInfo: author.contactInfo,
                }}
            />
        </div>
    );
}
