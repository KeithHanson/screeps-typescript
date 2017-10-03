import { NeedPriorities } from "./needs/needPriorities";

// A Need is just a job to do.
// This could be creating a new screep, fetching energy to build a structure, healing, etc.
// The hive mind is the central queue of needs and active jobs
export class Need {
  public priority: NeedPriorities;
  public type: string;
  public location: RoomPosition;
  public owner: any;

  constructor(priority: NeedPriorities, type: string, location: RoomPosition) {
    this.priority = priority;
    this.type = type;
    this.location = location;
  }

  public hash(): string {
    return `${this.type}-${this.priority}-${this.location.roomName}-${this.location.x}-${this.location.y}`;
  }

  public findOwner(): boolean {
    // Tell HiveMind Queue to find a suitable owner
    return false;
  }

  public doJob(): boolean {
    // Inherited classes should override this
    throw new Error("This call must be implemented by a child class.");
  }

}
