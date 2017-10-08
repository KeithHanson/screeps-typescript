import { Need } from "./need";

const IDLE_FLAG_NAME = "IdleSpot";

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

    for (const needPosition in NeedQueue.sortedQueue()) {
      const need = NeedQueue.currentQueue().queueArray()[needPosition];

      if (need.doJob()) {
        NeedQueue.currentQueue().queueArray().splice(parseInt(needPosition, 10), 1);
      }

      if (need.worker) {
        console.log(`(${need.priority}) Active Job - ${need.hash()} | Owner: ${need.worker.name}`);
      } else {
        // console.log(`(${need.priority}) Inactive Job - ${need.hash()}`);
      }
    }

    const idleFlag = Game.flags[IDLE_FLAG_NAME];

    for (const creepName in Game.creeps) {
      const creep = Game.creeps[creepName];
      if (creep.memory.isBusy !== true) {
        creep.moveTo(idleFlag.pos);
      }
    }

  }

  public static sortedQueue(): Need[] {
    return this.currentQueue().queueArray().sort( (a: Need, b: Need) => {
      if (a.priority < b.priority) {
        return -1;
      } else if (a.priority > b.priority) {
        return 1;
      } else {
        return 0;
      }
    } );
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
                                (thisNeed: Need) => thisNeed.hash() === need.hash()).length < need.maxActiveNeeds;

    if (!shouldAddNeed) {
      return false;
    } else {
      NeedQueue.currentQueue().queueArray().push(need);
      this.reprioritizeQueue();

      return true;
    }
  }

  private reprioritizeQueue() {
    for (const need of this._queueArray) {
      if (need.worker !== undefined && need.worker.memory.isMiner === false) {
        need.worker.memory.isBusy = false;
        need.worker.memory.isMiner = false;
        need.worker.memory.upgrading = false;
        need.worker.memory.building = false;
        delete need.worker;
      }
    }
  }
}
