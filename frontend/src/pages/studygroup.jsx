import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../App.js";
import "../styles.css";

export default function StudyGroupsPage() {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState("DSA Study Group");
  const groups = ["DSA Study Group", "Java Study Group", "React Study Group"];
  const [posts, setPosts] = useState([
    {
      id: "1",
      group: "DSA Study Group",
      author: "Elena Petrova",
      avatar: "👩‍💻",
      time: "5m ago",
      content: "Has anyone found a good resource for understanding Big O notation for recursive functions? I'm getting a bit stuck on the recurrence relations.",
      replies: [
        { author: "Alex Johnson", content: "Check out 'Introduction to Algorithms' by Cormen. Chapter 4 has a great section on recurrence relations!", time: "2m ago" },
        { author: "Kenji Tanaka", content: "I found this YouTube video helpful: [link]. It breaks down Big O for recursion clearly.", time: "1m ago" },
      ],
      likes: 3,
    },
    {
      id: "2",
      group: "Java Study Group",
      author: "Kenji Tanaka",
      avatar: "👨‍🏫",
      time: "1h ago",
      content: "Just a heads up, I've posted some notes on the latest changes to the Spring Framework. You can find them in the resources tab!",
      replies: [],
      likes: 5,
    },
  ]);
  const [newPost, setNewPost] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [newReply, setNewReply] = useState("");
  const maxPostLength = 280;

  // Handle group selection
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  // Handle post submission
  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim() || newPost.length > maxPostLength) return;
    setPosts([
      {
        id: `${Date.now()}`,
        group: selectedGroup,
        author: "Alex Johnson",
        avatar: "🧑‍🚀",
        time: "Just now",
        content: newPost,
        replies: [],
        likes: 0,
      },
      ...posts,
    ]);
    setNewPost("");
  };

  // Handle reply submission
  const handleReplySubmit = (e, postId) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [
                ...post.replies,
                { author: "Alex Johnson", content: newReply, time: "Just now" },
              ],
            }
          : post
      )
    );
    setNewReply("");
    setSelectedPostId(null);
  };

  // Handle like button
  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  // Filter posts by selected group
  const filteredPosts = posts.filter((post) => post.group === selectedGroup);

  return (
    <AppLayout pageTitle={selectedGroup}>
      <div className="centered-container">
        <div className="new-post-card card">
          <div className="card-header">
            <h2>Start a Discussion</h2>
            <button
              onClick={handleBack}
              className="study-groups-btn-secondary icon-btn"
              aria-label="Go back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="card-body">
            <div className="input-group">
              <label htmlFor="group-selector" className="input-group label">
                Select Study Group
              </label>
              <select
                id="group-selector"
                value={selectedGroup}
                onChange={handleGroupChange}
                className="group-selector"
                aria-label="Select study group"
              >
                {groups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <form onSubmit={handlePostSubmit}>
              <div className="input-group">
                <textarea
                  placeholder="Share your thoughts or tips..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  maxLength={maxPostLength}
                  className="post-input"
                  aria-label="New discussion post"
                />
                <div className={`char-count ${newPost.length > maxPostLength ? 'warning' : ''}`}>
                  {newPost.length}/{maxPostLength}
                </div>
              </div>
              <button
                type="submit"
                className="study-groups-btn-primary"
                disabled={!newPost.trim() || newPost.length > maxPostLength}
                aria-label="Post new discussion"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent-text)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Post
              </button>
            </form>
          </div>
        </div>

        {filteredPosts.map((post) => (
          <div key={post.id} className="post-card card">
            <div className="post-header">
              <span className="post-avatar">{post.avatar}</span>
              <div className="post-author-info">
                <span className="post-author">{post.author}</span>
                <span className="post-time">{post.time}</span>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            <div className="post-footer">
              <button
                className="study-groups-btn-secondary"
                onClick={() => handleLike(post.id)}
                aria-label={`Like post by ${post.author}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {post.likes} Likes
              </button>
              <button
                className="study-groups-btn-secondary"
                onClick={() => setSelectedPostId(post.id)}
                aria-label={`View ${post.replies.length} replies to post by ${post.author}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {post.replies.length} Replies
              </button>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="no-posts-card card">
            <p className="no-posts">No posts yet in {selectedGroup}. Start a discussion!</p>
          </div>
        )}

        {selectedPostId && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Replies</h2>
              <div className="replies-list">
                {posts
                  .find((post) => post.id === selectedPostId)
                  .replies.map((reply, index) => (
                    <div key={index} className="reply-item">
                      <div className="reply-header">
                        <span className="reply-avatar">🧑‍🚀</span>
                        <div>
                          <span className="reply-author">{reply.author}</span>
                          <span className="reply-time">{reply.time}</span>
                        </div>
                      </div>
                      <p className="reply-content">{reply.content}</p>
                    </div>
                  ))}
                {posts.find((post) => post.id === selectedPostId).replies.length === 0 && (
                  <p className="no-replies">No replies yet. Be the first to respond!</p>
                )}
              </div>
              <form onSubmit={(e) => handleReplySubmit(e, selectedPostId)}>
                <div className="input-group">
                  <label htmlFor="new-reply" className="input-group label">
                    Your Reply
                  </label>
                  <textarea
                    id="new-reply"
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Add your reply..."
                    required
                    className="reply-input"
                    aria-label="New reply"
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="study-groups-btn-secondary"
                    onClick={() => setSelectedPostId(null)}
                    aria-label="Cancel replying"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="study-groups-btn-primary"
                    aria-label="Post reply"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent-text)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon"
                    >
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Post Reply
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}