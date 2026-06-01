'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';

export default function AuthorRowActions({ authorId, authorName }: { authorId: string; authorName: string }) {
    const router = useRouter();

    return (
        <div className="flex gap-2">
            <Link href={`/admin/authors/${authorId}`} className="p-2 hover-white text-dim transition-colors" aria-label={`Edit ${authorName}`}>
                <Edit2 size={18} />
            </Link>
            <button
                type="button"
                className="p-2 hover-red text-dim transition-colors"
                aria-label={`Delete ${authorName}`}
                onClick={async () => {
                    const confirmed = window.confirm(`Delete ${authorName}?`);
                    if (!confirmed) return;

                    const res = await fetch(`/api/admin/authors/${authorId}`, { method: 'DELETE' });
                    if (res.ok) {
                        router.refresh();
                    }
                }}
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
