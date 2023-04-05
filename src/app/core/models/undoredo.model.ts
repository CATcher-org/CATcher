export class UndoRedo<T> {
  historyArray: Array<T>;
  currIndex: number;
  firstEntryIndex: number;
  lastEntryIndex: number;
  isSaved: boolean; // to keep track if the latest change have been saved
  intervalTime: number;
  timeout: NodeJS.Timeout;
  saveRunning: boolean;
  getState: () => T;

  constructor(capacity: number, getState: () => T, intervalTime: number = 0) {
    this.historyArray = new Array<T>(capacity);
    this.firstEntryIndex = 0;
    this.lastEntryIndex = -1;
    this.currIndex = -1;
    this.getState = getState;
    this.isSaved = false;
    this.saveRunning = false;
    this.intervalTime = intervalTime;
  }

  /**
   * Function to be called right before a change is made / stores the latest last state
   * preferably to be called with "beforeinput" event
   * @param entry optional entry to insert
   */
  updateBeforeChange(entry?: T): void {
    if (this.currIndex === -1) {
      return this.addEntry(entry ?? this.getState(), false);
    }
    this.createDelayedSave();
  }

  /**
   * Creates a timed delay to add entries to history.
   * Enables a more natural feel when performing high frequency saving.
   * Also prevents history from being rapidly filled up
   * Note:
   * If interval time is set to 0, this method should not be called
   * within (input) events. Use addEntry(T) instead.
   */
  createDelayedSave(): void {
    if (this.saveRunning) {
      return;
    }
    this.isSaved = false;
    this.saveRunning = true;
    // if interval time is 0 -> add entry will be called with false as parameter
    this.timeout = setTimeout(() => {
      this.addEntry(this.getState(), !!this.intervalTime);
    }, this.intervalTime);
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
    this.saveRunning = false;
  }

  incrementIndex(i: number): number {
    return (i + 1) % this.historyArray.length;
  }

  decrementIndex(i: number): number {
    return (i - 1 + this.historyArray.length) % this.historyArray.length;
  }

  /**
   * ignore timeout and forcefuly save the current state
   * @param entry optional parameter for element to be saved
   * @param check dont save if there are no new data
   * @param isLatest is the current state after the save step the latest
   */
  forceSave(entry?: T, check: boolean = false, isLatest: boolean = true): void {
    // if the there are unsaved changes, saves it
    clearTimeout(this.timeout);
    if (!check || !this.isSaved) {
      this.addEntry(entry ?? this.getState(), isLatest);
    }
    this.isSaved = isLatest;
  }

  /**
   * Stores the before and after state after running the function
   * @param check dont do initial save if there are no new data
   */
  wrapSave(func: Function, check: boolean = true) {
    clearTimeout(this.timeout);
    if (!check || !this.isSaved) {
      this.addEntry(this.getState(), false);
    }
    func();
    this.addEntry(this.getState(), true);
  }

  undo(): T | null {
    this.forceSave(undefined, true);
    if (this.currIndex === this.firstEntryIndex || this.currIndex === -1) {
      // if there are no more history to unwind
      return null;
    }
    this.currIndex = this.decrementIndex(this.currIndex);
    return this.historyArray[this.currIndex];
  }

  redo(): T | null {
    this.forceSave(undefined, true);
    if (this.currIndex === this.lastEntryIndex) {
      // if current state is already at the latest iteration
      return null;
    }
    this.currIndex = this.incrementIndex(this.currIndex);
    return this.historyArray[this.currIndex];
  }
}
