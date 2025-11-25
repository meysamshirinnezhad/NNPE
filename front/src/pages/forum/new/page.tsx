
import { useState } from 'react';
import Header from '../../../components/feature/Header';

const categories = [
  'Structural Analysis',
  'Concrete Design',
  'Steel Design',
  'Geotechnical Engineering',
  'Transportation Engineering',
  'Water Resources',
  'Environmental Engineering',
  'Construction Management',
  'General Discussion',
  'Study Tips',
  'Exam Preparation',
  'Career Advice'
];

const popularTags = [
  'beam-analysis', 'concrete-design', 'steel-connections', 'soil-mechanics',
  'traffic-engineering', 'hydrology', 'environmental-impact', 'project-management',
  'nppe-exam', 'study-group', 'practice-questions', 'career-advice'
];

export default function ForumNew() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleSubmit = () => {
    if (title.trim() && content.trim() && category) {
      // Handle form submission
      console.log({
        title,
        content,
        category,
        tags: selectedTags
      });
      // Redirect to forum or show success message
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Discussion</h1>
          <p className="text-gray-600">Share your knowledge and ask questions to help the engineering community</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">New Post</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsPreview(false)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    !isPreview 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Write
                </button>
                <button
                  onClick={() => setIsPreview(true)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isPreview 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!isPreview ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's your question or topic?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe your question or share your knowledge in detail..."
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    You can use markdown formatting. Be specific and provide context.
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-3">
                    {/* Selected Tags */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                            <button
                              onClick={() => handleTagToggle(tag)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Popular Tags */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Popular tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              selectedTags.includes(tag)
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Tag Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customTag}
                        onChange={(e) => setCustomTag(e.target.value)}
                        placeholder="Add custom tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                      />
                      <button
                        onClick={handleAddCustomTag}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                      >
                        Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Preview */
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{title || 'Your Title Here'}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Category: {category || 'No category selected'}</span>
                    <span>•</span>
                    <span>Posted by You</span>
                    <span>•</span>
                    <span>Just now</span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">
                    {content || 'Your content will appear here...'}
                  </p>
                </div>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
              <div className="text-sm text-gray-500">
                <i className="ri-information-line mr-1"></i>
                Make sure to follow our community guidelines
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  Save Draft
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!title.trim() || !content.trim() || !category}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Post Discussion
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Posting Guidelines</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start space-x-2">
              <i className="ri-check-line mt-0.5"></i>
              <span>Be specific and provide context for your questions</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-check-line mt-0.5"></i>
              <span>Use clear, descriptive titles that summarize your topic</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-check-line mt-0.5"></i>
              <span>Include relevant calculations, diagrams, or code when applicable</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-check-line mt-0.5"></i>
              <span>Tag your posts appropriately to help others find them</span>
            </li>
            <li className="flex items-start space-x-2">
              <i className="ri-check-line mt-0.5"></i>
              <span>Be respectful and constructive in all interactions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
