export class UndoRedo<T> {
    historyArray: Array<T>;
    currIndex: number;
    firstEntryIndex: number;
    lastEntryIndex: number;
  
    constructor(capacity: number, initialValue: T) {
      this.historyArray = new Array<T>(capacity);
      this.firstEntryIndex = 0;
      this.lastEntryIndex = 0;
      this.currIndex = 0;
      for (let i = 0; i < capacity; i++) {
        // initialize value
        this.historyArray[i] = initialValue;
      }
    }
  
    updateEntry(entry: T): void {
      this.currIndex = this.incrementIndex(this.currIndex);
      this.lastEntryIndex = this.currIndex; // resets future history
      if (this.currIndex === this.firstEntryIndex) {
        // in case history is already full. 
        this.firstEntryIndex = this.incrementIndex(this.firstEntryIndex);
      }
      this.historyArray[this.currIndex] = entry;
    }
  
    incrementIndex(i: number): number {
      return (i + 1) % this.historyArray.length;
    }
  
    decrementIndex(i: number): number {
      return (i - 1 + this.historyArray.length) % this.historyArray.length;
    }
  
    undo(): T {
      if (this.currIndex === this.firstEntryIndex) {
        // if there are no more history to unwind
        return this.historyArray[this.currIndex];
      }
      this.currIndex = this.decrementIndex(this.currIndex);
      return this.historyArray[this.currIndex];
    }
  
    redo(): T {
      if (this.currIndex === this.lastEntryIndex) {
        // if current state is already at the latest iteration
        return this.historyArray[this.currIndex];
      }
      this.currIndex = this.incrementIndex(this.currIndex);
      return this.historyArray[this.currIndex];
    }
  }