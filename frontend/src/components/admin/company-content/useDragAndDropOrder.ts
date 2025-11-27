import { useState } from 'react';

interface ItemWithOrder {
  id: string;
  displayOrder: number;
}

export function useDragAndDropOrder<T extends ItemWithOrder>(
  items: T[],
  onOrderChange?: (itemId: string, newOrder: number) => void
) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragEnd = (draggedId: string, targetId: string) => {
    if (!onOrderChange) {
      setDraggedId(null);
      return;
    }

    const sortedItems = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
    const draggedIndex = sortedItems.findIndex(item => item.id === draggedId);
    const targetIndex = sortedItems.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      setDraggedId(null);
      return;
    }

    const targetItem = sortedItems[targetIndex];
    const newOrder = targetItem.displayOrder;

    // Update all items between dragged and target positions
    if (draggedIndex < targetIndex) {
      // Moving down: shift items up
      for (let i = draggedIndex + 1; i <= targetIndex; i++) {
        onOrderChange(sortedItems[i].id, sortedItems[i].displayOrder - 1);
      }
    } else {
      // Moving up: shift items down
      for (let i = targetIndex; i < draggedIndex; i++) {
        onOrderChange(sortedItems[i].id, sortedItems[i].displayOrder + 1);
      }
    }

    // Update the dragged item's order
    onOrderChange(draggedId, newOrder);
    setDraggedId(null);
  };

  return {
    draggedId,
    handleDragStart,
    handleDragEnd,
  };
}

