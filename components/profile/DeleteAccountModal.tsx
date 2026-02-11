"use client";

import { useState, useEffect, useRef } from "react";
import { deleteAccount } from "@/app/profile/actions";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue("");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

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

  async function handleDelete() {
    if (value !== "DELETE") return;
    setStatus("deleting");
    setErrorMsg("");

    const result = await deleteAccount(value);

    if (result.error) {
      setStatus("error");
      setErrorMsg(result.error);
      return;
    }

    // Hard navigate so the browser picks up cleared cookies from the server action
    window.location.href = "/login";
  }

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay">
      <div className="delete-account-modal" ref={modalRef}>
        <div className="delete-modal-header">
          <span className="delete-modal-title">Delete Account</span>
          <button className="share-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="delete-modal-body">
          <div className="delete-warning">
            This action is permanent and cannot be undone. All your data —
            profile, saved jobs, activity history, and assessment results —
            will be permanently deleted.
          </div>

          <label className="delete-confirm-label">
            Type <strong>DELETE</strong> to confirm
          </label>
          <input
            className="delete-confirm-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
            spellCheck={false}
          />

          {status === "error" && errorMsg && (
            <div className="delete-error">{errorMsg}</div>
          )}
        </div>

        <div className="delete-modal-footer">
          <button className="drawer-cancel" onClick={onClose} disabled={status === "deleting"}>
            Cancel
          </button>
          <button
            className="delete-confirm-btn"
            onClick={handleDelete}
            disabled={value !== "DELETE" || status === "deleting"}
          >
            {status === "deleting" ? "Deleting..." : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
