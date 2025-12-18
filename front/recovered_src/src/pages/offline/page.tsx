
import Header from '../../components/feature/Header';

export default function Offline() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <i className="ri-wifi-off-line text-4xl text-gray-400"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Offline</h1>
          <p className="text-lg text-gray-600 mb-8">
            It looks like you've lost your internet connection. Don't worry, you can still access some features while offline.
          </p>

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Offline Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <i className="ri-book-line text-blue-600 text-xl"></i>
                <div>
                  <h3 className="font-medium text-gray-900">Cached Questions</h3>
                  <p className="text-sm text-gray-600">Practice previously loaded questions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <i className="ri-bookmark-line text-green-600 text-xl"></i>
                <div>
                  <h3 className="font-medium text-gray-900">Bookmarked Content</h3>
                  <p className="text-sm text-gray-600">Review your saved questions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <i className="ri-file-text-line text-purple-600 text-xl"></i>
                <div>
                  <h3 className="font-medium text-gray-900">Study Materials</h3>
                  <p className="text-sm text-gray-600">Access downloaded study guides</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <i className="ri-bar-chart-line text-orange-600 text-xl"></i>
                <div>
                  <h3 className="font-medium text-gray-900">Progress Data</h3>
                  <p className="text-sm text-gray-600">View your cached statistics</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">Offline Study Tips</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li className="flex items-start space-x-2">
                <i className="ri-check-line mt-0.5"></i>
                <span>Your progress will sync automatically when you reconnect</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="ri-check-line mt-0.5"></i>
                <span>Continue practicing with cached questions and materials</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="ri-check-line mt-0.5"></i>
                <span>Review your bookmarked questions for focused study</span>
              </li>
              <li className="flex items-start space-x-2">
                <i className="ri-check-line mt-0.5"></i>
                <span>Use this time to review theory and concepts</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <i className="ri-refresh-line mr-2"></i>
              Try to Reconnect
            </button>
            
            <div className="flex space-x-4">
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-bookmark-line mr-2"></i>
                View Bookmarks
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <i className="ri-file-text-line mr-2"></i>
                Study Materials
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Connection will be restored automatically when internet is available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
