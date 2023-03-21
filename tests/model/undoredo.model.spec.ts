import { UndoRedo } from '../../src/app/core/models/undoredo.model';

const SIZE = 5;

describe('UndoRedo model class', () => {
  let undoRedo: UndoRedo<number>;
  let observedVariable: number;

  beforeEach(() => {
    observedVariable = 0;
    undoRedo = new UndoRedo<number>(SIZE, () => observedVariable);
  });

  describe('.addEntry(T, boolean)', () => {
    it('should add a new element correctly to an empty history', () => {
      undoRedo.addEntry(1);
      expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(1);
      expect(undoRedo.currIndex).toBe(0);
      expect(undoRedo.firstEntryIndex).toBe(0);
      expect(undoRedo.lastEntryIndex).toBe(0);
    });

    describe('on a history with data', () => {
      beforeEach(() => {
        for (let i = 1; i < SIZE; i++) {
          undoRedo.addEntry(i, true);
        }
      });

      it('should add a new element to a partially filled history', () => {
        const currIndex = undoRedo.currIndex;

        expect(currIndex).toBe(SIZE - 2);
        expect(undoRedo.firstEntryIndex).toBe(0);
        expect(undoRedo.lastEntryIndex).toBe(currIndex);

        undoRedo.addEntry(SIZE);

        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(SIZE);
        expect(undoRedo.firstEntryIndex).toBe(0);
        expect(undoRedo.currIndex).toBe(currIndex + 1);
        expect(undoRedo.lastEntryIndex).toBe(currIndex + 1);
      });

      it('should add wrap around when adding new element to full history', () => {
        undoRedo.addEntry(SIZE);
        expect(undoRedo.currIndex).toBe(SIZE - 1);
        expect(undoRedo.firstEntryIndex).toBe(0);
        expect(undoRedo.lastEntryIndex).toBe(SIZE - 1);
        undoRedo.addEntry(SIZE + 1);
        expect(undoRedo.currIndex).toBe(0);
        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(SIZE + 1);
        expect(undoRedo.firstEntryIndex).toBe(1);
        expect(undoRedo.lastEntryIndex).toBe(0);
      });

      it('should correctly add new element to after undo and resets future states', () => {
        undoRedo.undo();
        undoRedo.undo();
        // 1 2 3 4 => 1 2
        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(2);
        expect(undoRedo.currIndex).toBe(SIZE - 4);
        expect(undoRedo.lastEntryIndex).toBe(SIZE - 2);
        undoRedo.addEntry(2.5);
        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(2.5);
        expect(undoRedo.currIndex).toBe(SIZE - 3);
        expect(undoRedo.lastEntryIndex).toBe(SIZE - 3);
      });
    });
  });

  describe('.undo()', () => {
    describe('null tests', () => {
      it('should return null on empty history', () => {
        expect(undoRedo.undo()).toBe(null);
      });

      it('should return null on last history', () => {
        undoRedo.addEntry(1);
        expect(undoRedo.undo()).toBe(null);
      });
    });

    describe('non-null tests', () => {
      beforeEach(() => {
        for (let i = 1; i < SIZE; i++) {
          undoRedo.addEntry(i, true);
        }
      });

      it('should return the last seen element', () => {
        // 1 2 3 4 => 1 2 (3) 4
        expect(undoRedo.undo()).toBe(3);
        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(3);
        expect(undoRedo.currIndex).toBe(SIZE - 3);
        expect(undoRedo.lastEntryIndex).toBe(SIZE - 2);
      });

      it('should poll for latest change if there are further changes', () => {
        undoRedo.isSaved = false;
        observedVariable = 999;
        // 1 2 3 4 => 1 2 3 (4) 999
        expect(undoRedo.undo()).toBe(4);
        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(4);
        expect(undoRedo.historyArray[undoRedo.currIndex + 1]).toBe(999);
        expect(undoRedo.currIndex).toBe(SIZE - 2);
        expect(undoRedo.lastEntryIndex).toBe(SIZE - 1);
      });
    });
  });

  describe('.redo()', () => {
    describe('null tests', () => {
      it('should return null on empty history', () => {
        expect(undoRedo.redo()).toBe(null);
      });

      it('should return null on latest history', () => {
        undoRedo.addEntry(1);
        expect(undoRedo.redo()).toBe(null);
      });
    });

    describe('non-null tests', () => {
      beforeEach(() => {
        for (let i = 1; i < SIZE; i++) {
          undoRedo.addEntry(i, true);
        }
        undoRedo.undo();
        undoRedo.undo();
        // 1 2 3 4 => 1 (2) 3 4
      });

      it('should return the last seen element', () => {
        // 1 (2) 3 4 => 1 2 (3) 4
        expect(undoRedo.redo()).toBe(3);
        expect(undoRedo.historyArray[undoRedo.currIndex]).toBe(3);
        expect(undoRedo.currIndex).toBe(SIZE - 3);
        expect(undoRedo.lastEntryIndex).toBe(SIZE - 2);
      });
    });
  });
});
