import { Need } from "./need";

export class NeedQueue {
  public static currentQueue(): NeedQueue {
    if (this._currentQueue == null) {
      this._currentQueue = new NeedQueue();
    }

    return this._currentQueue;
  }

  public static getJobCount(): number {
    return NeedQueue.currentQueue().queueArray().length;
  }

  public static doAllJobs() {
    console.log(`Current Needs Count: ${this.getJobCount()}`);

    for (const needPosition in NeedQueue.currentQueue().queueArray()) {
      const need = NeedQueue.currentQueue().queueArray()[needPosition];

      if (need.doJob()) {
        NeedQueue.currentQueue().queueArray().splice(parseInt(needPosition, 10), 1);
      }

      if (need.worker) {
        // console.log(`Active Job - ${need.hash()} | Owner: ${need.worker.name}`);
      } else {
        // console.log(`Inactive Job - ${need.hash()}`);
      }
    }
  }

  public static clearQueue() {
    NeedQueue.currentQueue()._queueArray = new Array<Need>();
    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];

      creep.memory.isBusy = false;
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
    const shouldAddNeed = _.select(NeedQueue.currentQueue().queueArray(),
                                (thisNeed: Need) => thisNeed.hash() === need.hash()).length <= need.maxActiveNeeds;

    if (!shouldAddNeed) {
      return false;
    } else {
      NeedQueue.currentQueue().queueArray().push(need);
      return true;
    }
  }
}
