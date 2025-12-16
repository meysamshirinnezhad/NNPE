import Button from '../base/Button';
import Card from '../base/Card';
import FutureFeature from './FutureFeature';

/**
 * Example component demonstrating Future/Coming Soon UI states
 * This is for documentation purposes - remove from production
 */
export default function FutureFeatureExample() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Future Feature Examples</h1>

      {/* Button Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Button Variants</h2>

        <div className="flex flex-wrap gap-4">
          {/* Normal buttons */}
          <Button>Normal Button</Button>
          <Button variant="secondary">Secondary Button</Button>

          {/* Future buttons with disabled state */}
          <Button disabled>Future Button</Button>
          <Button disabled size="sm">Small Future</Button>
          <Button disabled size="lg">Large Future</Button>
          <Button disabled>Custom Tooltip</Button>
          <Button disabled>Premium Feature</Button>
        </div>
      </div>

      {/* FutureFeature Wrapper Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">FutureFeature Wrapper</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Wrapped Card */}
          <FutureFeature>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Analytics</h3>
              <p className="text-gray-600 mb-4">
                Advanced analytics and insights for your learning progress.
              </p>
              <Button>View Analytics</Button>
            </Card>
          </FutureFeature>

          {/* Wrapped Card with custom tooltip */}
          <FutureFeature tooltip="Available in Q2 2024">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Study Assistant</h3>
              <p className="text-gray-600 mb-4">
                Get personalized study recommendations powered by AI.
              </p>
              <Button variant="secondary">Try AI Assistant</Button>
            </Card>
          </FutureFeature>

          {/* Wrapped section */}
          <FutureFeature>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Study Groups</h3>
              <p className="text-gray-600">
                Connect with other learners and study together.
              </p>
              <div className="flex gap-2">
                <Button size="sm">Join Group</Button>
                <Button size="sm" variant="secondary">Create Group</Button>
              </div>
            </div>
          </FutureFeature>

          {/* Enabled wrapper (for comparison) */}
          <FutureFeature disabled={false}>
            <Card className="p-6 border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Active Feature</h3>
              <p className="text-green-700 mb-4">
                This feature is currently active and available.
              </p>
              <Button>Access Feature</Button>
            </Card>
          </FutureFeature>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Usage Examples</h2>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Button with Disabled State:</h3>
          <pre className="text-sm text-gray-700">
{`<Button disabled>Coming Soon</Button>
<Button disabled>Custom Button</Button>`}
          </pre>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">FutureFeature Wrapper:</h3>
          <pre className="text-sm text-gray-700">
{`<FutureFeature>
  <Card>
    <h3>Premium Feature</h3>
    <Button>Access</Button>
  </Card>
</FutureFeature>

<FutureFeature tooltip="Q1 2024" disabled={true}>
  <div>Any content here</div>
</FutureFeature>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
