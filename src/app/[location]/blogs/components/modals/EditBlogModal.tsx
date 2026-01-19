"use client";

import React from "react";
import { BlogCrudModal } from "./BlogCrudModal";
import type { BlogRow } from "../../blogs.api";

interface EditBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  blog: BlogRow | null;
}

export function EditBlogModal({ isOpen, onClose, onSuccess, location, blog }: EditBlogModalProps) {
  return (
    <BlogCrudModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      location={location}
      mode="edit"
      initialData={blog?.id ? (blog as BlogRow & { id: number }) : null}
    />
  );
}


