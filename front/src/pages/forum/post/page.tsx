
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../../components/feature/Header';

interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  avatar: string;
  reputation: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  category: string;
  likes: number;
  replies: number;
  views: number;
  isLiked: boolean;
  avatar: string;
  reputation: number;
  tags: string[];
}

const mockPost: Post = {
  id: '1',
  title: 'Help with Moment Distribution Method - Continuous Beam Analysis',
  content: `I'm struggling with the moment distribution method for analyzing continuous beams. I understand the basic concept of distributing unbalanced moments, but I'm having trouble with the following:

1. How to determine the distribution factors correctly
2. When to stop the iteration process
3. How to handle different support conditions

Here's the specific problem I'm working on:
- 3-span continuous beam
- Spans: 6m, 8m, 6m
- Uniform loads: 20 kN/m, 15 kN/m, 25 kN/m
- All supports are simple supports except the intermediate ones

I've attached my work so far, but my final moments don't seem to balance correctly. Any guidance would be greatly appreciated!

Has anyone else encountered similar issues? What resources helped you master this method?`,
  author: 'Sarah Chen',
  timestamp: '2024-01-15T10:30:00Z',
  category: 'Structural Analysis',
  likes: 12,
  replies: 8,
  views: 156,
  isLiked: false,
  avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20engineer%20avatar%20portrait%20with%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=avatar1&orientation=squarish',
  reputation: 245,
  tags: ['moment-distribution', 'continuous-beam', 'structural-analysis', 'help-needed']
};

const mockReplies: Reply[] = [
  {
    id: '1',
    author: 'Mike Rodriguez',
    content: `Great question! The moment distribution method can be tricky at first. Here are some key points:

**Distribution Factors:**
- DF = (4EI/L) / Σ(4EI/L) for all members meeting at a joint
- For your beam, calculate the relative stiffness of each span
- Remember that pinned ends have DF = 0

**Iteration Process:**
- Continue until unbalanced moments are less than 1% of the largest moment
- Usually 3-4 cycles are sufficient for practical accuracy

I'd be happy to walk through your specific problem if you can share your calculations!`,
    timestamp: '2024-01-15T11:15:00Z',
    likes: 8,
    isLiked: true,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20male%20engineer%20avatar%20portrait%20with%20construction%20background%2C%20clean%20simple%20style&width=40&height=40&seq=avatar2&orientation=squarish',
    reputation: 892
  },
  {
    id: '2',
    author: 'Dr. Jennifer Liu',
    content: `@Sarah Chen - This is a common challenge! I recommend starting with a simpler 2-span beam first to build confidence.

For your 3-span problem:
1. Calculate stiffness factors: K = I/L for each span
2. Distribution factors at each joint
3. Start with fixed-end moments for each span
4. Distribute and carry-over systematically

The key is being methodical. I've seen students rush through the iterations and make arithmetic errors. Take your time!

Also, check out the structural analysis textbook by Hibbeler - Chapter 12 has excellent examples.`,
    timestamp: '2024-01-15T12:45:00Z',
    likes: 15,
    isLiked: false,
    avatar: 'https://readdy.ai/api/search-image?query=professional%20female%20professor%20avatar%20portrait%20with%20academic%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=avatar3&orientation=squarish',
    reputation: 1456
  }
];

export default function ForumPost() {
  const { } = useParams();
  const [post, setPost] = useState(mockPost);
  const [replies, setReplies] = useState(mockReplies);
  const [newReply, setNewReply] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLikePost = () => {
    setPost(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
    }));
  };

  const handleLikeReply = (replyId: string) => {
    setReplies(prev => prev.map(reply => 
      reply.id === replyId 
        ? { ...reply, isLiked: !reply.isLiked, likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1 }
        : reply
    ));
  };

  const handleSubmitReply = () => {
    if (newReply.trim()) {
      const reply: Reply = {
        id: Date.now().toString(),
        author: 'You',
        content: newReply,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        avatar: 'https://readdy.ai/api/search-image?query=professional%20engineer%20avatar%20portrait%20with%20modern%20engineering%20background%2C%20clean%20simple%20style&width=40&height=40&seq=avatar4&orientation=squarish',
        reputation: 156
      };
      setReplies(prev => [...prev, reply]);
      setNewReply('');
      setShowReplyForm(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/forum" className="hover:text-blue-600">Forum</a>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-blue-600">{post.category}</span>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-gray-900 truncate">{post.title}</span>
          </div>
        </nav>

        {/* Main Post */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              <img 
                src={post.avatar} 
                alt={post.author}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{post.author}</h3>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{post.reputation} reputation</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleLikePost}
                    className={`flex items-center space-x-1 ${post.isLiked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
                  >
                    <i className={`${post.isLiked ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}`}></i>
                    <span>{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <i className="ri-chat-3-line"></i>
                    <span>{replies.length} replies</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <i className="ri-eye-line"></i>
                    <span>{post.views} views</span>
                  </div>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600">
                    <i className="ri-share-line"></i>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{replies.length} Replies</h2>
            <button 
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Write a Reply</h3>
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Share your knowledge and help the community..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button 
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitReply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}

          {/* Reply List */}
          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start space-x-4">
                <img 
                  src={reply.avatar} 
                  alt={reply.author}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{reply.author}</h4>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{reply.reputation} reputation</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatTimestamp(reply.timestamp)}</span>
                  </div>
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-700 whitespace-pre-line">{reply.content}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleLikeReply(reply.id)}
                      className={`flex items-center space-x-1 ${reply.isLiked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
                    >
                      <i className={`${reply.isLiked ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'}`}></i>
                      <span>{reply.likes}</span>
                    </button>
                    <button className="text-gray-500 hover:text-blue-600 whitespace-nowrap">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
