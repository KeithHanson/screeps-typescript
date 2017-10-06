import { NeedPriorities } from "./needs/needPriorities";

export const ROOM_NAME = "W7N3";

export const MY_ROOM = Game.rooms[ROOM_NAME];

// A Need is just a job to do.
// This could be creating a new screep, fetching energy to build a structure, healing, etc.
// The hive mind is the central queue of needs and active jobs
export class Need {
  public priority: NeedPriorities;
  public type: string;
  public location: RoomPosition;
  public owner: any;
  public worker: Creep;
  public maxActiveNeeds: number;

  constructor(priority: NeedPriorities, type: string, location: RoomPosition) {
    this.priority = priority;
    this.type = type;
    this.location = location;
    this.maxActiveNeeds = 1;
  }

  public hash(): string {
    return `${this.type}-${this.location.roomName}-${this.location.x}-${this.location.y}`;
  }

  public findWorker(): boolean {
    if (this.worker !== undefined) {
      this.worker = Game.creeps[this.worker.name];

      return true;
    }

    const myCreeps = MY_ROOM.find(FIND_MY_CREEPS, {
      filter: (creep: Creep) => creep.memory.isBusy === undefined || creep.memory.isBusy === false
    });

    for (const creep of myCreeps) {
      const typedCreep: Creep = creep as Creep;

      if (typedCreep === undefined) {
        continue;
      }

      if (typedCreep.memory.isBusy === undefined) {
        typedCreep.memory.isBusy = false;
      }

      if (!typedCreep.memory.isBusy) {
        this.worker = typedCreep;
        this.worker.memory.isBusy = true;
        return true;
      }
    }
    return false;
  }

  public doJob(): boolean {
    // Inherited classes should override this
    throw new Error("This call must be implemented by a child class.");
  }

}
