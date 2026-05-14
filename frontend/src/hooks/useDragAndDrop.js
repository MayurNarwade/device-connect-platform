import { useCallback, useState, useRef } from 'react';

export function useDragAndDrop(onDrop) {
  const [isDragOver, setIsDragOver] = useState(false);
  const counter = useRef(0);

  const handleDragIn = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    counter.current++;
    if (e.dataTransfer.items?.length > 0) setIsDragOver(true);
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    counter.current--;
    if (counter.current === 0) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    counter.current = 0;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onDrop(files);
  }, [onDrop]);

  return { isDragOver, handlers: { onDragEnter: handleDragIn, onDragLeave: handleDragOut, onDragOver: handleDragOver, onDrop: handleDrop } };
}