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

      if (this.worker.carry.energy === this.worker.carryCapacity || this.worker.memory.upgrading === true) {
        this.handleTransfer();
      } else {
        this.handleHarvest();
      }
    }

    const result = this.checkCompletion();

    if (result && this.worker !== undefined && this.worker.memory !== undefined) {
      this.worker.memory.isBusy = false;
    }

    return result;
  }

  private handleTransfer(): void {
    this.handleSpawnTransfer();
  }

  private handleSpawnTransfer(): void {
    let transferResult: number;

    if (this.owner.structureType === STRUCTURE_CONTROLLER) {
      transferResult = this.worker.upgradeController(this.owner as StructureController);

      if (transferResult === OK && this.worker.carry.energy as number > 0) {
        this.worker.memory.upgrading = true;
      } else {
        this.worker.memory.upgrading = false;
      }
    } else {
      transferResult = this.worker.transfer(this.owner, RESOURCE_ENERGY, this.worker.carry.energy);

      const energyLeft = this.getEnergyLeft();

      console.log(`TRANSFER RESULT: ${transferResult}. ENERGY LEFT: ${energyLeft}`);

      if (energyLeft < this.worker.carryCapacity) {
        transferResult = this.worker.transfer(this.owner, RESOURCE_ENERGY, energyLeft);
      }
    }

    if (transferResult === ERR_NOT_IN_RANGE) {
      this.worker.moveTo(this.owner.pos);
    }
  }

  private handleHarvest(): void {
    if (this.worker.harvest(ENERGY_SOURCE) === ERR_NOT_IN_RANGE) {
      this.worker.moveTo(ENERGY_SOURCE.pos);
    }
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

        return currentEnergy === currentTotalEnergy;
      case STRUCTURE_EXTENSION:
        typedContainer = this.owner as StructureExtension;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        return currentEnergy === currentTotalEnergy;
      case STRUCTURE_SPAWN:
        typedContainer = this.owner as StructureSpawn;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        return currentEnergy === currentTotalEnergy;
      case STRUCTURE_CONTROLLER:
        return false;
    }
    return false;
  }

  private getEnergyLeft(): number {
    let currentEnergy = -1;
    let currentTotalEnergy = -1;
    let typedContainer = null;

    this.owner = Game.getObjectById(this.owner.id) as Structure;

    switch (this.owner.structureType) {
      case STRUCTURE_CONTAINER:
        typedContainer = this.owner as StructureContainer;

        currentEnergy = typedContainer.store.energy;
        currentTotalEnergy = typedContainer.storeCapacity;

        return currentTotalEnergy - currentEnergy;
      case STRUCTURE_EXTENSION:
        typedContainer = this.owner as StructureExtension;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        return currentTotalEnergy - currentEnergy;
      case STRUCTURE_SPAWN:
        typedContainer = this.owner as StructureSpawn;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        return currentTotalEnergy - currentEnergy;
      case STRUCTURE_CONTROLLER:
        return 1;
    }
    return 0;
  }
}
