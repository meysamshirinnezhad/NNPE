
import { useEffect, useState } from 'react';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import { updateSEO, seoData } from '../../utils/seo';

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updateSEO(seoData.blog);
  }, []);

  const categories = [
    { id: 'all', name: 'All Posts', count: 24 },
    { id: 'study-tips', name: 'Study Tips', count: 8 },
    { id: 'success-stories', name: 'Success Stories', count: 6 },
    { id: 'exam-prep', name: 'Exam Preparation', count: 5 },
    { id: 'engineering', name: 'Engineering Topics', count: 5 }
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'How to Create an Effective NPPE Study Schedule',
      excerpt: 'Learn the proven strategies for organizing your study time and maximizing retention for the NPPE exam.',
      category: 'study-tips',
      author: 'Dr. Sarah Mitchell',
      date: '2024-01-15',
      readTime: '8 min read',
      image: 'professional engineer studying at desk with books and laptop organized workspace modern lighting focused concentration',
      tags: ['Study Planning', 'Time Management', 'NPPE']
    },
    {
      id: 2,
      title: 'From Engineer to P.Eng: My NPPE Journey',
      excerpt: 'A mechanical engineer shares their complete journey from preparation to passing the NPPE exam on the first attempt.',
      category: 'success-stories',
      author: 'Michael Rodriguez',
      date: '2024-01-12',
      readTime: '12 min read',
      image: 'successful professional engineer celebrating achievement office environment diploma certificate modern workspace',
      tags: ['Success Story', 'Mechanical Engineering', 'Career']
    },
    {
      id: 3,
      title: 'Understanding Professional Ethics in Engineering',
      excerpt: 'Deep dive into the ethical principles that form the foundation of professional engineering practice.',
      category: 'engineering',
      author: 'Prof. Jennifer Liu',
      date: '2024-01-10',
      readTime: '15 min read',
      image: 'engineering ethics concept professional responsibility modern office environment business meeting discussion',
      tags: ['Ethics', 'Professional Practice', 'Engineering Law']
    },
    {
      id: 4,
      title: 'Top 10 Common NPPE Exam Mistakes to Avoid',
      excerpt: 'Learn from the most frequent errors candidates make and how to avoid them in your exam preparation.',
      category: 'exam-prep',
      author: 'David Thompson',
      date: '2024-01-08',
      readTime: '10 min read',
      image: 'exam preparation mistakes checklist professional engineer reviewing notes study materials organized desk',
      tags: ['Exam Tips', 'Common Mistakes', 'Preparation']
    },
    {
      id: 5,
      title: 'Managing Engineering Projects: A P.Eng Perspective',
      excerpt: 'Essential project management skills every professional engineer needs to master for career success.',
      category: 'engineering',
      author: 'Lisa Chen',
      date: '2024-01-05',
      readTime: '14 min read',
      image: 'engineering project management team meeting blueprints construction plans professional office environment',
      tags: ['Project Management', 'Leadership', 'Professional Skills']
    },
    {
      id: 6,
      title: 'How I Passed NPPE While Working Full-Time',
      excerpt: 'Balancing work, family, and exam preparation - practical strategies that actually work.',
      category: 'success-stories',
      author: 'Robert Kim',
      date: '2024-01-03',
      readTime: '11 min read',
      image: 'busy professional engineer balancing work and study laptop books office environment time management',
      tags: ['Work-Life Balance', 'Time Management', 'Success Story']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Engineering Insights & Resources
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert advice, study tips, and success stories to help you excel in your engineering career and NPPE preparation.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search articles..."
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <Card className="mb-12 overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={`https://readdy.ai/api/search-image?query=$%7BfilteredPosts%5B0%5D.image%7D&width=600&height=400&seq=featured-post&orientation=landscape`}
                  alt={filteredPosts[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    Featured
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{filteredPosts[0].readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {filteredPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  {filteredPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={`https://readdy.ai/api/search-image?query=professional%20engineer%20author%20portrait%20$%7BfilteredPosts%5B0%5D.author%7D&width=40&height=40&seq=author-${filteredPosts[0].id}&orientation=squarish`}
                      alt={filteredPosts[0].author}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{filteredPosts[0].author}</p>
                      <p className="text-sm text-gray-500">{filteredPosts[0].date}</p>
                    </div>
                  </div>
                  <Button>
                    Read Article
                    <i className="ri-arrow-right-line ml-2"></i>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <img
                src={`https://readdy.ai/api/search-image?query=$%7Bpost.image%7D&width=400&height=250&seq=blog-${post.id}&orientation=landscape`}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    post.category === 'study-tips' ? 'bg-green-100 text-green-800' :
                    post.category === 'success-stories' ? 'bg-purple-100 text-purple-800' :
                    post.category === 'exam-prep' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {categories.find(c => c.id === post.category)?.name}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={`https://readdy.ai/api/search-image?query=professional%20engineer%20author%20portrait%20$%7Bpost.author%7D&width=32&height=32&seq=author-small-${post.id}&orientation=squarish`}
                      alt={post.author}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Read More
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="mt-16 text-center bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Stay Updated with Engineering Insights
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Get the latest study tips, success stories, and engineering resources delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button className="whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No spam, unsubscribe at any time.
            </p>
          </div>
        </Card>
      </main>

      <MobileNavigation />
    </div>
  );
}
