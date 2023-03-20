export class UndoRedo<T> {
    historyArray: Array<T>;
    currIndex: number;
    firstEntryIndex: number;
    lastEntryIndex: number;
    isSaved: boolean; // to keep track if the latest change have been saved
    getState: () => T;

    constructor(capacity: number, getState: () => T) {
      this.historyArray = new Array<T>(capacity);
      this.firstEntryIndex = 0;
      this.lastEntryIndex = -1;
      this.currIndex = -1;
      this.getState = getState;
      this.isSaved = false;
    }

    /**
     * Function to be called right before a change is made / stores the latest last state
     * preferably to be called with "beforeinput" event
     * @param entry optional entry to insert
     */
    updateBeforeChange(entry?: T) {
      this.addEntry(entry ?? this.getState(), false);
    }

    /**
     * Manually inserts changes
     * Should not be called manually in a context of text editors
     * @param entry entry to insert
     * @param isLatest guarentees that the changes are the latest
     */
    addEntry(entry: T, isLatest: boolean = true): void {
      this.isSaved = isLatest;
      const newIndex = this.incrementIndex(this.currIndex);
      if (newIndex === this.firstEntryIndex && this.currIndex !== -1) {
        // in case history is already full.
        this.firstEntryIndex = this.incrementIndex(this.firstEntryIndex);
      }
      this.lastEntryIndex = newIndex; // resets future history
      this.currIndex = newIndex;
      this.historyArray[this.currIndex] = entry;
    }

    incrementIndex(i: number): number {
      return (i + 1) % this.historyArray.length;
    }

    decrementIndex(i: number): number {
      return (i - 1 + this.historyArray.length) % this.historyArray.length;
    }

    undo(): T | null {
      // if the there are unsaved changes, saves it
      if (!this.isSaved) {
        this.addEntry(this.getState(), true);
      }

      if (this.currIndex === this.firstEntryIndex || this.currIndex === -1) {
        // if there are no more history to unwind
        return null;
      }
      this.currIndex = this.decrementIndex(this.currIndex);
      return this.historyArray[this.currIndex];
    }

    redo(): T | null {
      /** redo assumes some undo operation is already saved
       * thus there is no need to save current state as redo won't
       * fire if it is the latest change */
      if (this.currIndex === this.lastEntryIndex) {
        // if current state is already at the latest iteration
        return null;
      }
      this.currIndex = this.incrementIndex(this.currIndex);
      return this.historyArray[this.currIndex];
    }
  }
