import MotionPage from '../components/motion-page';
import Card from '../components/ui/card';

export default function Settings() {
  return (
    <MotionPage>
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <p className="text-gray-500">Advanced options (trusted devices, appearance) coming soon.</p>
        </Card>
      </div>
    </MotionPage>
  );
}