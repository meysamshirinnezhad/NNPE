
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../../components/feature/Header';
import Button from '../../../components/base/Button';
import Card from '../../../components/base/Card';
import LoadingSpinner from '../../../components/effects/LoadingSpinner';
import ProgressBar from '../../../components/base/ProgressBar';
import { studyService } from '../../../api';

interface ModuleContent {
  id: string;
  type: 'text' | 'video' | 'practice';
  title: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  week: number;
  estimatedTime: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
  content: ModuleContent[];
  progress: number;
  completed: boolean;
}

export default function ModuleDetail() {
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const actualModuleId = moduleId || searchParams.get('id') || '';
  const navigate = useNavigate();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeContentId, setActiveContentId] = useState<string>('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading module data
    setTimeout(() => {
      const mockModule: Module = {
        id: moduleId || '1',
        title: 'Structural Engineering Fundamentals',
        description: 'Master the core principles of structural engineering including load analysis, material properties, and design methodologies.',
        week: 1,
        estimatedTime: 240, // minutes
        difficulty: 'Intermediate',
        topics: ['Load Analysis', 'Material Properties', 'Beam Design', 'Column Design'],
        progress: 65,
        completed: false,
        content: [
          {
            id: '1',
            type: 'text',
            title: 'Introduction to Structural Engineering',
            content: `Structural engineering is a sub-discipline of civil engineering that deals with the analysis and design of structures that support or resist loads. This includes buildings, bridges, towers, and other infrastructure.

Key principles include:
• Understanding load paths and how forces flow through structures
• Material properties and their behavior under different conditions
• Safety factors and design codes
• Economic considerations in design decisions

The structural engineer must ensure that structures are safe, serviceable, and economical. This requires a thorough understanding of mechanics, materials science, and construction methods.`,
            duration: 15,
            completed: true
          },
          {
            id: '2',
            type: 'video',
            title: 'Load Types and Analysis Methods',
            videoUrl: 'https://example.com/video1',
            duration: 25,
            completed: true
          },
          {
            id: '3',
            type: 'text',
            title: 'Material Properties in Structural Design',
            content: `Understanding material properties is crucial for structural design. Key properties include:

**Steel Properties:**
• High strength-to-weight ratio
• Ductile behavior
• Consistent material properties
• Susceptible to corrosion and fire

**Concrete Properties:**
• High compressive strength
• Low tensile strength
• Creep and shrinkage effects
• Durability considerations

**Design Considerations:**
• Factor of safety selection
• Load combinations
• Serviceability requirements
• Environmental effects`,
            duration: 20,
            completed: false
          },
          {
            id: '4',
            type: 'practice',
            title: 'Practice Problems: Beam Design',
            duration: 30,
            completed: false
          },
          {
            id: '5',
            type: 'video',
            title: 'Column Design Principles',
            videoUrl: 'https://example.com/video2',
            duration: 30,
            completed: false
          },
          {
            id: '6',
            type: 'practice',
            title: 'Module Assessment',
            duration: 45,
            completed: false
          }
        ]
      };
      setModule(mockModule);
      setActiveContentId(mockModule.content[0].id);
      setLoading(false);
    }, 1000);
  }, [moduleId]);

  const handleContentSelect = (contentId: string) => {
    setActiveContentId(contentId);
  };

  const markContentComplete = async (contentId: string) => {
    if (!module || !actualModuleId) return;
    
    setSaving(true);
    try {
      const updatedContent = module.content.map(content =>
        content.id === contentId ? { ...content, completed: true } : content
      );
      
      const completedCount = updatedContent.filter(c => c.completed).length;
      const newProgress = Math.round((completedCount / updatedContent.length) * 100);
      
      await studyService.updateModuleProgress(actualModuleId, {
        progress: newProgress,
        time_spent_seconds: 300 // Track actual time in real app
      });
      
      if (newProgress === 100) {
        await studyService.completeModule(actualModuleId);
      }
      
      setModule({
        ...module,
        content: updatedContent,
        progress: newProgress,
        completed: newProgress === 100
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setSaving(false);
    }
  };

  const getNextContent = () => {
    if (!module) return null;
    const currentIndex = module.content.findIndex(c => c.id === activeContentId);
    return currentIndex < module.content.length - 1 ? module.content[currentIndex + 1] : null;
  };

  const getPreviousContent = () => {
    if (!module) return null;
    const currentIndex = module.content.findIndex(c => c.id === activeContentId);
    return currentIndex > 0 ? module.content[currentIndex - 1] : null;
  };

  const renderContent = () => {
    if (!module) return null;
    
    const activeContent = module.content.find(c => c.id === activeContentId);
    if (!activeContent) return null;

    switch (activeContent.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeContent.title}</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {activeContent.content}
            </div>
          </div>
        );
      
      case 'video':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeContent.title}</h2>
            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6">
              <div className="text-center text-white">
                <i className="ri-play-circle-line text-6xl mb-4"></i>
                <p className="text-lg">Video Content</p>
                <p className="text-sm text-gray-300">Duration: {activeContent.duration} minutes</p>
              </div>
            </div>
            <p className="text-gray-600">
              This video covers the fundamental concepts and practical applications related to {activeContent.title.toLowerCase()}.
            </p>
          </div>
        );
      
      case 'practice':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{activeContent.title}</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <i className="ri-pencil-line text-4xl text-blue-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">Practice Session</h3>
              <p className="text-blue-700 mb-6">
                Complete practice problems to reinforce your understanding of the concepts covered in this module.
              </p>
              <Button
                onClick={() => navigate('/practice')}
                className="flex items-center space-x-2"
              >
                <i className="ri-play-line"></i>
                <span>Start Practice</span>
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" variant="engineering" />
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Module Not Found</h2>
            <p className="text-gray-600 mb-6">The module you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/study-path')}>
              Back to Study Path
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const activeContent = module.content.find(c => c.id === activeContentId);
  const nextContent = getNextContent();
  const previousContent = getPreviousContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/study-path')}
              className="flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Study Path</span>
            </Button>
            
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Week {module.week}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {module.difficulty}
              </span>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{module.title}</h1>
          <p className="text-gray-600 mb-4">{module.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <i className="ri-time-line"></i>
              <span>{Math.floor(module.estimatedTime / 60)}h {module.estimatedTime % 60}m</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="ri-bookmark-line"></i>
              <span>{module.topics.join(', ')}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ProgressBar value={module.progress} />
            </div>
            <span className="text-sm font-medium text-gray-600">{module.progress}% complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Module Content</h3>
                <div className="space-y-2">
                  {module.content.map((content, index) => (
                    <button
                      key={content.id}
                      onClick={() => handleContentSelect(content.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeContentId === content.id
                          ? 'bg-blue-100 border border-blue-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          content.completed
                            ? 'bg-green-500 text-white'
                            : activeContentId === content.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                        }`}>
                          {content.completed ? (
                            <i className="ri-check-line"></i>
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <i className={`text-sm ${
                              content.type === 'video' ? 'ri-play-line text-red-500' :
                              content.type === 'practice' ? 'ri-pencil-line text-green-500' :
                              'ri-file-text-line text-blue-500'
                            }`}></i>
                            <span className="text-xs text-gray-500">{content.duration}m</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {content.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-8">
                {renderContent()}
                
                {/* Content Actions */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    {activeContent && !activeContent.completed && (
                      <Button
                        onClick={() => markContentComplete(activeContent.id)}
                        variant="secondary"
                        disabled={saving}
                        className="flex items-center space-x-2 text-green-600"
                      >
                        <i className="ri-check-line"></i>
                        <span>{saving ? 'Saving...' : 'Mark Complete'}</span>
                      </Button>
                    )}
                    
                    {activeContent?.completed && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <i className="ri-check-circle-fill"></i>
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    {previousContent && (
                      <Button
                        variant="secondary"
                        onClick={() => handleContentSelect(previousContent.id)}
                        className="flex items-center space-x-2"
                      >
                        <i className="ri-arrow-left-line"></i>
                        <span>Previous</span>
                      </Button>
                    )}
                    
                    {nextContent ? (
                      <Button
                        onClick={() => handleContentSelect(nextContent.id)}
                        className="flex items-center space-x-2"
                      >
                        <span>Next</span>
                        <i className="ri-arrow-right-line"></i>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/study-path')}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                      >
                        <span>Complete Module</span>
                        <i className="ri-check-line"></i>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
