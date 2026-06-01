'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Phone, Save, User, X } from 'lucide-react';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

interface AuthorFormProps {
    authorId?: string;
    initialData?: {
        name: string;
        role: string | null;
        avatar: string | null;
        bio: string | null;
        email: string | null;
        contactInfo: string | null;
    };
    isEditing?: boolean;
}

export default function AuthorForm({ authorId, initialData, isEditing = false }: AuthorFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        role: initialData?.role || 'Reporter',
        avatar: initialData?.avatar || '',
        bio: initialData?.bio || '',
        email: initialData?.email || '',
        contactInfo: initialData?.contactInfo || '',
    });

    const actionUrl = isEditing && authorId ? `/api/admin/authors/${authorId}` : '/api/admin/authors';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('role', formData.role);
            data.append('bio', formData.bio);
            data.append('email', formData.email);
            data.append('contactInfo', formData.contactInfo);
            data.append('existingAvatar', formData.avatar.startsWith('blob:') ? '' : formData.avatar);
            data.append('removeAvatar', removeAvatar ? 'true' : 'false');

            if (imageFile) {
                data.append('image', imageFile);
            }

            const res = await fetch(actionUrl, {
                method: 'POST',
                body: data,
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to save author');
            }

            router.push('/admin/authors');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            setError('Image must be 2MB or smaller.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('Only image uploads are allowed.');
            return;
        }

        setError(null);
        setImageFile(file);
        setRemoveAvatar(false);

        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, avatar: previewUrl }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl animate-in fade-in slide-in-from-bottom-4">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-card border-all rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Full Name</span>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-muted border-all rounded-xl px-4 py-3 text-white focus-accent outline-none"
                                placeholder="e.g. Seana Collins"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Role</span>
                            <input
                                type="text"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-muted border-all rounded-xl px-4 py-3 text-white focus-accent outline-none"
                                placeholder="Reporter, Contributor, Editor"
                            />
                        </label>
                    </div>

                    <div className="block">
                        <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Profile Image</span>
                        <div className="flex flex-col gap-4 bg-muted p-4 rounded-xl border-all md:flex-row md:items-center">
                            <div className="h-24 w-24 rounded-2xl bg-dim flex items-center justify-center flex-shrink-0 overflow-hidden relative shadow-lg">
                                {formData.avatar && !removeAvatar ? (
                                    <Image src={formData.avatar} alt="Author Preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <User size={32} className="text-dim" />
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <label className="cursor-pointer bg-accent hover:bg-white text-black font-bold py-2 px-4 rounded-lg transition-all text-sm">
                                        Upload Image
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <span className="text-xs text-dim">2MB max. Stored in the database as base64.</span>
                                </div>
                                {imageFile && (
                                    <span className="text-xs text-dim italic truncate block">
                                        {imageFile.name}
                                    </span>
                                )}
                                {(formData.avatar || initialData?.avatar) && !removeAvatar && (
                                    <button
                                        type="button"
                                        className="text-xs text-red-400 hover:text-red-300"
                                        onClick={() => {
                                            setImageFile(null);
                                            setRemoveAvatar(true);
                                            setFormData((prev) => ({ ...prev, avatar: '' }));
                                        }}
                                    >
                                        Remove image
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Email Address</span>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-muted border-all rounded-xl pl-11 pr-4 py-3 text-white focus-accent outline-none"
                                    placeholder="reporter@mainenewsnow.com"
                                />
                            </div>
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Contact Info</span>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" />
                                <input
                                    type="text"
                                    value={formData.contactInfo}
                                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                    className="w-full bg-muted border-all rounded-xl pl-11 pr-4 py-3 text-white focus-accent outline-none"
                                    placeholder="Signal, phone, desk line, or beat details"
                                />
                            </div>
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-sm font-bold text-dim uppercase tracking-widest mb-2 block">Biography</span>
                        <textarea
                            rows={5}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-muted border-all rounded-xl px-4 py-3 text-white focus-accent outline-none resize-none"
                            placeholder="Short contributor bio for the public newsroom section..."
                        />
                    </label>
                </div>

                <div className="p-6 bg-dim border-t flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-xl border-all text-dim hover-white transition-all flex items-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary px-8"
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {isEditing ? 'Save Profile' : 'Create Profile'}
                    </button>
                </div>
            </div>
        </form>
    );
}
