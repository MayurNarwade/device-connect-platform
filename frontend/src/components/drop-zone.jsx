import { useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

export default function DropZone({ onFilesDrop }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const counter = useRef(0);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    counter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    counter.current--;
    if (counter.current === 0) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    counter.current = 0;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onFilesDrop) onFilesDrop(files);
  }, [onFilesDrop]);

  return (
    <motion.div
      className={`glass-card border-2 border-dashed rounded-3xl p-10 text-center transition-colors ${
        isDragOver ? 'border-accent bg-accent/10' : 'border-white/40'
      }`}
      whileHover={{ scale: 1.01 }}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <UploadCloud size={40} className="mx-auto text-accent mb-3" />
      <p className="text-lg font-semibold text-gray-700">Drop files here</p>
      <p className="text-sm text-gray-400">or click the button above</p>
    </motion.div>
  );
}