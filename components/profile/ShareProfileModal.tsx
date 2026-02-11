"use client";

import { useState, useEffect, useRef } from "react";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function ShareProfileModal({
  isOpen,
  onClose,
  username,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${username}`
      : `/u/${username}`;

  const encodedUrl = encodeURIComponent(profileUrl);
  const shareText = encodeURIComponent(
    "Check out my professional profile on bigmovv!"
  );

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay">
      <div className="share-modal" ref={modalRef}>
        <div className="share-modal-header">
          <span className="share-modal-title">Share Profile</span>
          <button className="share-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Copy URL */}
        <div className="share-url-row">
          <span className="share-url-text">{profileUrl}</span>
          <button className="share-copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {/* Social links */}
        <div className="share-social-row">
          <a
            className="share-social-btn"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="share-social-btn"
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            X / Twitter
          </a>
          <a
            className="share-social-btn"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
