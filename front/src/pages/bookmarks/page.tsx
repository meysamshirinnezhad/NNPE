import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import MobileNavigation from '../../components/feature/MobileNavigation';
import Card from '../../components/base/Card';
import Button from '../../components/base/Button';
import LoadingSpinner from '../../components/effects/LoadingSpinner';
import { updateSEO } from '../../utils/seo';
import { userService, questionService } from '../../api';
import type { Bookmark } from '../../api/types';

export default function Bookmarks() {
  const [selectedTopic] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    updateSEO({
      title: 'Bookmarked Questions - NPPE Pro',
      description: 'Review your bookmarked NPPE questions',
      keywords: 'bookmarks, saved questions, NPPE',
      canonical: '/bookmarks'
    });
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const data = await userService.getBookmarks();
        setBookmarks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


  const filteredBookmarks = bookmarks.filter(bookmark => {
    const question = bookmark.question;
    if (!question) return false;
    
    const matchesTopic = selectedTopic === 'all' || question.topic_id === selectedTopic;
    const matchesSearch = searchQuery === '' ||
      question.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const sortedBookmarks = [...filteredBookmarks].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'difficulty':
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return (difficultyOrder[b.question?.difficulty as keyof typeof difficultyOrder] || 0) -
               (difficultyOrder[a.question?.difficulty as keyof typeof difficultyOrder] || 0);
      default:
        return 0;
    }
  });

  const removeBookmark = async (questionId: string) => {
    try {
      await questionService.removeBookmark(questionId);
      setBookmarks(prev => prev.filter(b => b.question_id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 text-center">
            <i className="ri-error-warning-line text-4xl text-red-500 mb-3"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading bookmarks</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <i className="ri-refresh-line mr-2"></i>
              Retry
            </Button>
          </Card>
        </main>
        <MobileNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bookmarked Questions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and practice your saved questions
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center">
            <i className="ri-bookmark-line text-5xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
            <p className="text-gray-600 mb-6">
              Bookmark questions during practice to review them here later.
            </p>
            <Button onClick={() => navigate('/practice')}>
              Start Practicing
            </Button>
          </Card>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>

            {/* Bookmarks List */}
            <div className="space-y-4">
              {sortedBookmarks.map((bookmark) => {
                const question = bookmark.question;
                if (!question) return null;
                
                return (
                  <Card key={bookmark.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(bookmark.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 
                          className="text-lg font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => navigate(`/practice/question/${question.id}`)}
                        >
                          {question.content}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {question.options.map((option) => (
                            <span 
                              key={option.id} 
                              className={`px-3 py-1 text-sm rounded-full ${
                                option.is_correct 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {option.option_text}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => removeBookmark(question.id)}
                        className="ml-4"
                      >
                        <i className="ri-bookmark-fill"></i>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {sortedBookmarks.length === 0 && (
              <Card className="p-12 text-center">
                <i className="ri-search-line text-5xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </Card>
            )}
          </>
        )}
      </main>
      <MobileNavigation />
    </div>
  );
}
