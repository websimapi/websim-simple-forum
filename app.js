import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const room = new WebsimSocket();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');

  useEffect(() => {
    // Subscribe to post collection
    const unsubscribe = room.collection('post')
      .filter({ parent_id: null })
      .subscribe(setPosts);

    return () => unsubscribe();
  }, []);

  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    await room.collection('post').create({
      message: newPostText,
      parent_id: null
    });

    setNewPostText('');
  };

  return (
    <div>
      <header className="forum-header">
        <h1>Simple Forum</h1>
      </header>

      <form className="new-post-form" onSubmit={handleNewPost}>
        <textarea 
          placeholder="What's on your mind?"
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
        />
        <button type="submit" className="btn">Post</button>
      </form>

      {posts.map(post => (
        <Post key={post.id} post={post} room={room} />
      ))}
    </div>
  );
}

function Post({ post, room, isReply = false }) {
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const unsubscribe = room.collection('post')
      .filter({ parent_id: post.id })
      .subscribe(setReplies);

    return () => unsubscribe();
  }, [post.id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    await room.collection('post').create({
      message: replyText,
      parent_id: post.id
    });

    setReplyText('');
  };

  return (
    <div className={`post ${isReply ? 'reply' : ''}`}>
      <div className="post-header">
        <div className="user-info">
          <img 
            src={`https://images.websim.ai/avatar/${post.username}`} 
            alt={`${post.username}'s avatar`} 
          />
          <strong>{post.username}</strong>
        </div>
      </div>
      <p>{post.message}</p>

      <form className="new-post-form" onSubmit={handleReply}>
        <textarea 
          placeholder="Write a reply..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button type="submit" className="btn">Reply</button>
      </form>

      {replies.length > 0 && (
        <div className="replies">
          {replies.map(reply => (
            <Post key={reply.id} post={reply} room={room} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);