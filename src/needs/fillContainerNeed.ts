import {Need} from "../need";
import {NeedQueue} from "../needQueue";
import {NeedPriorities} from "./needPriorities";

export const ROOM_NAME = "W7N3";

export const MY_ROOM = Game.rooms[ROOM_NAME];

export const ENERGY_SOURCE = Game.getObjectById("9263077296e02bb") as Source;

export class FillContainerNeed extends Need {
  public owner: Structure;

  constructor(structure: Structure) {
    super(NeedPriorities.HARVEST, "fillContainer", structure.pos);

    this.owner = structure;
    this.maxActiveNeeds = 2;

    NeedQueue.currentQueue().insertNeed(this);
  }

  public doJob() {
    if (this.findWorker()) {

      if (this.worker.carry.energy === this.worker.carryCapacity) {
        this.worker.say("Transfering");

        const transferResult = this.worker.transfer(this.owner, RESOURCE_ENERGY);

        if (transferResult === ERR_NOT_IN_RANGE) {
          this.worker.say("Move Transfer");
          this.worker.moveTo(this.owner.pos, {
            visualizePathStyle: {
              fill: "transparent",
              lineStyle: "dashed",
              opacity: .1,
              stroke: "#fff",
              strokeWidth: .15
            }
          });
        } else if (transferResult === OK || transferResult === ERR_FULL) {
          const complete = this.checkCompletion();
          return complete;
        }

      } else {
        this.worker.say("Harvesting");
        if (this.worker.harvest(ENERGY_SOURCE) === ERR_NOT_IN_RANGE) {
          this.worker.say("Move Harvest");
          this.worker.moveTo(ENERGY_SOURCE.pos, {
            visualizePathStyle: {
              fill: "transparent",
              lineStyle: "dashed",
              opacity: .1,
              stroke: "#fff",
              strokeWidth: .15
            }
          });
        }
      }
    }

    const result = this.checkCompletion();

    if (result) {
      this.worker.memory.isBusy = false;
    }

    return result;
  }

  private checkCompletion(): boolean {
    let currentEnergy = -1;
    let currentTotalEnergy = -1;
    let typedContainer = null;

    this.owner = Game.getObjectById(this.owner.id) as Structure;

    switch (this.owner.structureType) {
      case STRUCTURE_CONTAINER:
        typedContainer = this.owner as StructureContainer;

        currentEnergy = typedContainer.store.energy;
        currentTotalEnergy = typedContainer.storeCapacity;

        console.log(`${currentEnergy}/${currentTotalEnergy}`);

        return currentEnergy === currentTotalEnergy;
      case STRUCTURE_EXTENSION:
        typedContainer = this.owner as StructureExtension;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        console.log(`${currentEnergy}/${currentTotalEnergy}`);

        return currentEnergy === currentTotalEnergy;
      case STRUCTURE_SPAWN:
        typedContainer = this.owner as StructureSpawn;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        console.log(`${currentEnergy}/${currentTotalEnergy}`);

        return currentEnergy === currentTotalEnergy;
    }
    return false;
  }
}
