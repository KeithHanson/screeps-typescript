import { Need } from "./need";

export class NeedQueue {
  public static currentQueue(): NeedQueue {
    if (this._currentQueue == null) {
      this._currentQueue = new NeedQueue();
    }

    return this._currentQueue;
  }

  public static findGreatestNeedNearMe(roomObject: RoomObject): any {
    if (NeedQueue.currentQueue().queueArray().length > 0) {
      let greatestCostNeed = null;
      let greatestCost = 100000000;

      for (const need of NeedQueue.currentQueue().queueArray()) {
        const cost = PathFinder.search(roomObject.pos, need.location).cost;

        if (cost < greatestCost) {
          greatestCost = cost;
          greatestCostNeed = need;
        }
      }

      return greatestCostNeed;
    } else {
      return null;
    }
  }

  public static doAllJobs() {
    for (const need of NeedQueue.currentQueue().queueArray()) {
      console.log(`Doing job: ${need.hash()}`);
      need.doJob();
    }
  }

  private static _currentQueue: NeedQueue;

  private _queueArray: Need[];

  constructor() {
    this._queueArray = new Array<Need>();
    NeedQueue._currentQueue = this;
  }

  public queueArray(): Need[] {
    if (this._queueArray == null) {
      this._queueArray = new Array<Need>();
    }
    return this._queueArray;
  }

  public insertNeed(need: Need): boolean {
    console.log("Inserting Need... " + need.hash());

    const duplicateNeed = this.findFirstNeedByHash(need.hash());

    if (duplicateNeed != null) {
      console.log("Found duplicate need. Ignoring.");
      return false;
    } else {
      console.log("No duplicate needs found. Inserting.");
      NeedQueue.currentQueue().queueArray().push(need);
      return true;
    }
  }

  private findFirstNeedByHash(hash: string): any {
    for (const need of NeedQueue.currentQueue().queueArray()) {
      if (need.hash() === hash) {
        return need;
      }
    }
    return null;
  }
}
