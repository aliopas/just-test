import { useState } from 'react';
import { palette } from '../../../styles/theme';

interface DraggableTableRowProps {
  id: string;
  children: React.ReactNode;
  onDragEnd: (draggedId: string, targetId: string) => void;
  onDragStart?: (id: string) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
}

export function DraggableTableRow({
  id,
  children,
  onDragEnd,
  onDragStart,
  isDragging = false,
  style,
}: DraggableTableRowProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.currentTarget.style.opacity = '0.5';
    if (onDragStart) {
      onDragStart(id);
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.style.opacity = '1';
    setIsOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    setIsOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== id) {
      onDragEnd(draggedId, id);
    }
  };

  return (
    <tr
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        ...style,
        cursor: 'move',
        backgroundColor: isOver
          ? `${palette.brandPrimaryStrong}10`
          : isDragging
            ? `${palette.textSecondary}10`
            : 'transparent',
        transition: 'background-color 0.2s ease',
        position: 'relative',
      }}
    >
      {children}
    </tr>
  );
}

