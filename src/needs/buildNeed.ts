import {Need} from "../need";
import {NeedQueue} from "../needQueue";
import {NeedPriorities} from "./needPriorities";

export const ROOM_NAME = "W7N3";

export const MY_ROOM = Game.rooms[ROOM_NAME];

export const ENERGY_SOURCE = Game.getObjectById("c12d077296e6ac9") as Source;

export class BuildNeed extends Need {
  public owner: ConstructionSite;

  constructor(site: ConstructionSite) {
    super(NeedPriorities.BUILD, "buildSite", site.pos);

    this.owner = site;
    this.maxActiveNeeds = 8;

    NeedQueue.currentQueue().insertNeed(this);
  }

  public doJob() {
    if (this.findWorker()) {

      if (this.worker.carry.energy === this.worker.carryCapacity || this.worker.memory.building === true) {
        this.handleTransfer();
      } else {
        this.handleHarvest();
      }
    }

    const result = this.checkCompletion();

    if (result) {
      this.worker.memory.isBusy = false;
    }

    return result;
  }

  private handleHarvest(): void {
    if (this.worker.harvest(ENERGY_SOURCE) === ERR_NOT_IN_RANGE) {
      this.worker.moveTo(ENERGY_SOURCE.pos);
    }
  }

  private handleTransfer(): void {
    let transferResult: number;

    transferResult = this.worker.build(this.owner);

    if (transferResult === OK && this.worker.carry.energy as number > 0) {
      this.worker.memory.building = true;
    } else {
      this.worker.memory.building = false;
    }

    if (transferResult === ERR_NOT_IN_RANGE) {
      this.worker.moveTo(this.owner.pos);
    }
  }

  private checkCompletion(): boolean {
    return Game.getObjectById(this.owner.id) === undefined;
  }
}
