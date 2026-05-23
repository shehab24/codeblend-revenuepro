"use client";
import { useState, useTransition, useRef, useEffect } from "react";
import { addUserRequestNote } from "../noteActions";

type Note = {
  id: string;
  authorRole: string;
  authorName: string | null;
  message: string;
  createdAt: string;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export function RequestNoteThread({ requestId, notes }: { requestId: string; notes: Note[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setError("");
    startTransition(async () => {
      const res = await addUserRequestNote(requestId, trimmed);
      if (res.success) {
        setMessage("");
      } else {
        setError(res.error || "Failed to send.");
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-sm font-bold text-slate-700">Updates & Notes</h3>
        <span className="ml-auto text-xs text-slate-400">{notes.length} message{notes.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Thread */}
      <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            <svg className="w-8 h-8 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            No messages yet. Add a note to communicate with the team.
          </div>
        ) : (
          notes.map((note) => {
            const isAdmin = note.authorRole === "admin";
            return (
              <div key={note.id} className={`px-6 py-4 flex gap-3 ${isAdmin ? "bg-emerald-50/40" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${isAdmin ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {isAdmin ? "A" : (note.authorName?.charAt(0).toUpperCase() || "U")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-700">
                      {isAdmin ? "CodeBlend Team" : (note.authorName || "You")}
                    </span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[0.6rem] font-bold rounded uppercase tracking-wide">Admin</span>
                    )}
                    <span className="text-[0.65rem] text-slate-400 ml-auto">{formatTime(note.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{note.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
        {error && (
          <p className="text-xs text-red-500 font-medium mb-2">{error}</p>
        )}
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add an update or ask a question... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition resize-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isPending || !message.trim()}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 border-none cursor-pointer"
          >
            {isPending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
