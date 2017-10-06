import {Need} from "../need";
import {NeedQueue} from "../needQueue";
import {NeedPriorities} from "./needPriorities";

export const BASE_CREEP_BODY = [WORK, MOVE, CARRY];

export class CreepNeed extends Need {
  public owner: Spawn;

  constructor(spawn: Spawn) {
    super(NeedPriorities.CREEP, "creep", spawn.pos);

    this.owner = spawn;

    NeedQueue.currentQueue().insertNeed(this);
  }

  public doJob(): boolean {
    if (this.owner) {
      const result = this.owner.spawnCreep(BASE_CREEP_BODY, `${this.hash()}-${this.generateUUID()}`);

      if (result === 0) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  private generateUUID(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
