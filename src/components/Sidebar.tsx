import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface Conversation {
  _id: Id<"conversations">;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
  onNew: () => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onSignOut,
  isOpen,
  onClose,
}: SidebarProps) {
  const removeConversation = useMutation(api.conversations.remove);

  const handleDelete = async (e: React.MouseEvent, id: Id<"conversations">) => {
    e.stopPropagation();
    await removeConversation({ id });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside
      className={`fixed lg:relative z-40 h-screen w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-display text-cream text-lg">
              Voice<span className="text-amber-500">AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-steel hover:text-cream transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-amber-500 font-display uppercase tracking-wider text-xs py-3 px-4 rounded-lg hover:from-amber-500/20 hover:to-amber-600/20 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-steel/50 text-sm font-body">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => onSelect(conv._id)}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                activeId === conv._id
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`font-body text-sm truncate ${
                  activeId === conv._id ? "text-cream" : "text-steel"
                }`}>
                  {conv.title}
                </p>
                <p className="text-xs text-steel/50 mt-0.5">
                  {formatDate(conv.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, conv._id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-steel/50 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 text-steel hover:text-cream font-body text-sm py-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
