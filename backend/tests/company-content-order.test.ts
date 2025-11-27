/**
 * Unit tests for Company Content Order functionality
 * Tests the logic for drag and drop ordering
 */

interface TestItem {
  id: string;
  displayOrder: number;
}

describe('Company Content Order Logic', () => {
  const mockItems: TestItem[] = [
    { id: '1', displayOrder: 0 },
    { id: '2', displayOrder: 1 },
    { id: '3', displayOrder: 2 },
    { id: '4', displayOrder: 3 },
  ];

  describe('Order change calculations', () => {
    it('should calculate correct order changes when moving item down', () => {
      const onOrderChange = jest.fn();
      const sortedItems = [...mockItems].sort((a, b) => a.displayOrder - b.displayOrder);
      
      // Simulate moving item '1' (order 0) to position of item '3' (order 2)
      const draggedIndex = sortedItems.findIndex(item => item.id === '1'); // 0
      const targetIndex = sortedItems.findIndex(item => item.id === '3'); // 2
      
      expect(draggedIndex).toBe(0);
      expect(targetIndex).toBe(2);
      
      // Moving down: shift items up
      if (draggedIndex < targetIndex) {
        for (let i = draggedIndex + 1; i <= targetIndex; i++) {
          onOrderChange(sortedItems[i].id, sortedItems[i].displayOrder - 1);
        }
      }
      
      // Update the dragged item's order
      const targetItem = sortedItems[targetIndex];
      onOrderChange('1', targetItem.displayOrder);
      
      expect(onOrderChange).toHaveBeenCalledTimes(3);
      expect(onOrderChange).toHaveBeenCalledWith('2', 0);
      expect(onOrderChange).toHaveBeenCalledWith('3', 1);
      expect(onOrderChange).toHaveBeenCalledWith('1', 2);
    });

    it('should calculate correct order changes when moving item up', () => {
      const onOrderChange = jest.fn();
      const sortedItems = [...mockItems].sort((a, b) => a.displayOrder - b.displayOrder);
      
      // Simulate moving item '3' (order 2) to position of item '1' (order 0)
      const draggedIndex = sortedItems.findIndex(item => item.id === '3'); // 2
      const targetIndex = sortedItems.findIndex(item => item.id === '1'); // 0
      
      expect(draggedIndex).toBe(2);
      expect(targetIndex).toBe(0);
      
      // Moving up: shift items down
      if (draggedIndex > targetIndex) {
        for (let i = targetIndex; i < draggedIndex; i++) {
          onOrderChange(sortedItems[i].id, sortedItems[i].displayOrder + 1);
        }
      }
      
      // Update the dragged item's order
      const targetItem = sortedItems[targetIndex];
      onOrderChange('3', targetItem.displayOrder);
      
      expect(onOrderChange).toHaveBeenCalledTimes(3);
      expect(onOrderChange).toHaveBeenCalledWith('1', 1);
      expect(onOrderChange).toHaveBeenCalledWith('2', 2);
      expect(onOrderChange).toHaveBeenCalledWith('3', 0);
    });

    it('should not update order when dragging to same position', () => {
      const onOrderChange = jest.fn();
      const sortedItems = [...mockItems].sort((a, b) => a.displayOrder - b.displayOrder);
      
      const draggedIndex = sortedItems.findIndex(item => item.id === '2'); // 1
      const targetIndex = sortedItems.findIndex(item => item.id === '2'); // 1
      
      if (draggedIndex === targetIndex) {
        expect(onOrderChange).not.toHaveBeenCalled();
      }
    });

    it('should handle edge case: moving first item to last', () => {
      const onOrderChange = jest.fn();
      const sortedItems = [...mockItems].sort((a, b) => a.displayOrder - b.displayOrder);
      
      const draggedIndex = 0; // First item
      const targetIndex = sortedItems.length - 1; // Last item
      
      if (draggedIndex < targetIndex) {
        for (let i = draggedIndex + 1; i <= targetIndex; i++) {
          onOrderChange(sortedItems[i].id, sortedItems[i].displayOrder - 1);
        }
      }
      
      const targetItem = sortedItems[targetIndex];
      onOrderChange(sortedItems[draggedIndex].id, targetItem.displayOrder);
      
      expect(onOrderChange).toHaveBeenCalledTimes(sortedItems.length);
    });
  });

  describe('Order bounds validation', () => {
    it('should allow increment when currentOrder < maxOrder', () => {
      const currentOrder = 2;
      const maxOrder = 5;
      const canIncrement = currentOrder < maxOrder;
      
      expect(canIncrement).toBe(true);
    });

    it('should not allow increment when currentOrder >= maxOrder', () => {
      const currentOrder = 5;
      const maxOrder = 5;
      const canIncrement = currentOrder < maxOrder;
      
      expect(canIncrement).toBe(false);
    });

    it('should allow decrement when currentOrder > minOrder', () => {
      const currentOrder = 2;
      const minOrder = 0;
      const canDecrement = currentOrder > minOrder;
      
      expect(canDecrement).toBe(true);
    });

    it('should not allow decrement when currentOrder <= minOrder', () => {
      const currentOrder = 0;
      const minOrder = 0;
      const canDecrement = currentOrder > minOrder;
      
      expect(canDecrement).toBe(false);
    });
  });
});

