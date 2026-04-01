import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) return [];
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    audioBase64: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Not found");
    }
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: args.role,
      content: args.content,
      audioBase64: args.audioBase64,
      createdAt: Date.now(),
    });
    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });
    // Update title if this is the first user message
    if (args.role === "user") {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .collect();
      if (messages.length === 1) {
        const title = args.content.slice(0, 50) + (args.content.length > 50 ? "..." : "");
        await ctx.db.patch(args.conversationId, { title });
      }
    }
    return messageId;
  },
});

export const updateAudio = mutation({
  args: {
    messageId: v.id("messages"),
    audioBase64: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const message = await ctx.db.get(args.messageId);
    if (!message || message.userId !== userId) {
      throw new Error("Not found");
    }
    await ctx.db.patch(args.messageId, { audioBase64: args.audioBase64 });
  },
});
