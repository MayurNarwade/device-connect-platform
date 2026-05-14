import Card from './ui/card';
import { Monitor, Smartphone } from 'lucide-react';

export default function DeviceCard({ name, isLocal = false }) {
  return (
    <Card className="flex items-center gap-4 w-full">
      <div className="p-3 rounded-full bg-white/60 backdrop-blur">
        {isLocal ? <Monitor size={24} className="text-accent" /> : <Smartphone size={24} className="text-accent" />}
      </div>
      <div>
        <p className="font-semibold">{name || (isLocal ? 'This Device' : 'Partner Device')}</p>
        <p className="text-xs text-gray-500">{isLocal ? 'You' : 'Connected'}</p>
      </div>
    </Card>
  );
}