
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { updateSEO, seoData } from '../../utils/seo';

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updateSEO(seoData.forum);
  }, []);

  const categories = [
    { id: 'all', name: 'All Discussions', count: 156, icon: 'ri-chat-3-line' },
    { id: 'general', name: 'General Discussion', count: 45, icon: 'ri-chat-1-line' },
    { id: 'study-tips', name: 'Study Tips', count: 32, icon: 'ri-lightbulb-line' },
    { id: 'exam-prep', name: 'Exam Preparation', count: 28, icon: 'ri-file-text-line' },
    { id: 'career', name: 'Career Advice', count: 24, icon: 'ri-briefcase-line' },
    { id: 'technical', name: 'Technical Questions', count: 18, icon: 'ri-tools-line' },
    { id: 'success-stories', name: 'Success Stories', count: 9, icon: 'ri-trophy-line' }
  ];

  const forumPosts = [
    {
      id: 1,
      title: 'How to effectively manage time during the NPPE exam?',
      category: 'exam-prep',
      author: {
        name: 'Sarah Chen',
        avatar: 'professional female engineer avatar confident smile modern office background',
        title: 'Mechanical Engineer',
        reputation: 245
      },
      content: 'I\'m struggling with time management during practice tests. Any tips on how to pace myself during the actual exam?',
      replies: 12,
      views: 89,
      lastActivity: '2 hours ago',
      tags: ['time-management', 'exam-strategy', 'practice-tests'],
      isPinned: false,
      isAnswered: true,
      votes: 8
    },
    {
      id: 2,
      title: 'Passed NPPE on first attempt - My complete study strategy',
      category: 'success-stories',
      author: {
        name: 'Michael Rodriguez',
        avatar: 'professional male engineer success story confident expression office environment',
        title: 'Civil Engineer, P.Eng',
        reputation: 412
      },
      content: 'Just received my results and I passed! Here\'s the complete study strategy that worked for me...',
      replies: 28,
      views: 234,
      lastActivity: '4 hours ago',
      tags: ['success-story', 'study-strategy', 'first-attempt'],
      isPinned: true,
      isAnswered: false,
      votes: 24
    },
    {
      id: 3,
      title: 'Ethics case study discussion - Conflict of interest scenarios',
      category: 'technical',
      author: {
        name: 'Jennifer Liu',
        avatar: 'professional female engineer ethics discussion serious expression modern office',
        title: 'Electrical Engineer',
        reputation: 189
      },
      content: 'Let\'s discuss some complex conflict of interest scenarios that might appear on the exam...',
      replies: 15,
      views: 156,
      lastActivity: '6 hours ago',
      tags: ['ethics', 'case-study', 'conflict-of-interest'],
      isPinned: false,
      isAnswered: true,
      votes: 11
    },
    {
      id: 4,
      title: 'Best resources for Professional Practice topics?',
      category: 'study-tips',
      author: {
        name: 'David Thompson',
        avatar: 'professional male engineer study resources question expression office background',
        title: 'Software Engineer',
        reputation: 156
      },
      content: 'I\'m looking for additional resources to supplement the course materials for Professional Practice...',
      replies: 9,
      views: 67,
      lastActivity: '8 hours ago',
      tags: ['resources', 'professional-practice', 'study-materials'],
      isPinned: false,
      isAnswered: true,
      votes: 5
    },
    {
      id: 5,
      title: 'Study group formation - Toronto area',
      category: 'general',
      author: {
        name: 'Lisa Wang',
        avatar: 'professional female engineer study group organizer friendly smile office environment',
        title: 'Chemical Engineer',
        reputation: 98
      },
      content: 'Looking to form a study group for engineers in the Toronto area. Anyone interested?',
      replies: 7,
      views: 45,
      lastActivity: '12 hours ago',
      tags: ['study-group', 'toronto', 'collaboration'],
      isPinned: false,
      isAnswered: false,
      votes: 3
    },
    {
      id: 6,
      title: 'Contract law questions - Need clarification on liability clauses',
      category: 'technical',
      author: {
        name: 'Robert Kim',
        avatar: 'professional male engineer contract law question serious expression office background',
        title: 'Mechanical Engineer',
        reputation: 134
      },
      content: 'I\'m having trouble understanding some of the liability clauses in engineering contracts...',
      replies: 6,
      views: 38,
      lastActivity: '1 day ago',
      tags: ['contracts', 'liability', 'legal'],
      isPinned: false,
      isAnswered: false,
      votes: 2
    }
  ];

  const filteredPosts = forumPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      case 'popular':
        return b.votes - a.votes;
      case 'replies':
        return b.replies - a.replies;
      case 'views':
        return b.views - a.views;
      default:
        return 0;
    }
  });

  // Separate pinned posts
  const pinnedPosts = sortedPosts.filter(post => post.isPinned);
  const regularPosts = sortedPosts.filter(post => !post.isPinned);

  const getReputationBadge = (reputation: number) => {
    if (reputation >= 400) return { text: 'Expert', color: 'bg-purple-100 text-purple-700' };
    if (reputation >= 200) return { text: 'Advanced', color: 'bg-blue-100 text-blue-700' };
    if (reputation >= 100) return { text: 'Member', color: 'bg-green-100 text-green-700' };
    return { text: 'Newcomer', color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Community Forum
            </h1>
            <p className="text-gray-600">
              Connect with fellow engineers, share knowledge, and get support for your NPPE preparation.
            </p>
          </div>
          <Button>
            <i className="ri-add-line mr-2"></i>
            New Discussion
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Discussions</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-search-line text-gray-400"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search discussions..."
                />
              </div>
            </Card>

            {/* Categories */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <i className={`${category.icon} mr-3`}></i>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Sort Options */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                {[
                  { id: 'recent', name: 'Most Recent', icon: 'ri-time-line' },
                  { id: 'popular', name: 'Most Popular', icon: 'ri-heart-line' },
                  { id: 'replies', name: 'Most Replies', icon: 'ri-chat-3-line' },
                  { id: 'views', name: 'Most Views', icon: 'ri-eye-line' }
                ].map((sort) => (
                  <button
                    key={sort.id}
                    onClick={() => setSortBy(sort.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      sortBy === sort.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${sort.icon} mr-3`}></i>
                    <span className="text-sm font-medium">{sort.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Forum Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Forum Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Discussions</span>
                  <span className="text-sm font-medium text-gray-900">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Members</span>
                  <span className="text-sm font-medium text-gray-900">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Replies</span>
                  <span className="text-sm font-medium text-gray-900">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Online Now</span>
                  <span className="text-sm font-medium text-green-600">12</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {sortedPosts.length} Discussions
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedCategory !== 'all' && `in ${categories.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>
            </div>

            {/* Pinned Posts */}
            {pinnedPosts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <i className="ri-pushpin-line mr-2"></i>
                  Pinned Discussions
                </h3>
                <div className="space-y-4">
                  {pinnedPosts.map((post) => (
                    <Card key={post.id} className="border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <i className="ri-pushpin-fill text-blue-600"></i>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {categories.find(c => c.id === post.category)?.name}
                            </span>
                            {post.isAnswered && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Answered
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {post.content}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <img
                                src={`https://readdy.ai/api/search-image?query=$%7Bpost.author.avatar%7D&width=32&height=32&seq=forum-author-${post.id}&orientation=squarish`}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getReputationBadge(post.author.reputation).color}`}>
                                    {getReputationBadge(post.author.reputation).text}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">{post.author.title}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <i className="ri-heart-line mr-1"></i>
                                <span>{post.votes}</span>
                              </div>
                              <div className="flex items-center">
                                <i className="ri-chat-3-line mr-1"></i>
                                <span>{post.replies}</span>
                              </div>
                              <div className="flex items-center">
                                <i className="ri-eye-line mr-1"></i>
                                <span>{post.views}</span>
                              </div>
                              <span>{post.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Regular Posts */}
            <div className="space-y-4">
              {regularPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {categories.find(c => c.id === post.category)?.name}
                        </span>
                        {post.isAnswered && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Answered
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.content}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={`https://readdy.ai/api/search-image?query=$%7Bpost.author.avatar%7D&width=32&height=32&seq=forum-author-${post.id}&orientation=squarish`}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${getReputationBadge(post.author.reputation).color}`}>
                                {getReputationBadge(post.author.reputation).text}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{post.author.title}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <i className="ri-heart-line mr-1"></i>
                            <span>{post.votes}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="ri-chat-3-line mr-1"></i>
                            <span>{post.replies}</span>
                          </div>
                          <div className="flex items-center">
                            <i className="ri-eye-line mr-1"></i>
                            <span>{post.views}</span>
                          </div>
                          <span>{post.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {sortedPosts.length === 0 && (
              <Card className="text-center py-12">
                <i className="ri-chat-3-line text-4xl text-gray-400 mb-4 block"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to start a discussion in this category!'}
                </p>
                <Button>
                  <i className="ri-add-line mr-2"></i>
                  Start New Discussion
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>

      <MobileNavigation />
    </div>
  );
}
