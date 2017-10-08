import {Need} from "../need";
import {NeedQueue} from "../needQueue";
import {NeedPriorities} from "./needPriorities";

import * as Config from "../config";

// import {Traveler} from "traveler";

// const travelerInstance = new Traveler();

export class FillContainerNeed extends Need {
  public owner: Structure;

  constructor(structure: Structure) {
    super(NeedPriorities.HARVEST, "fillContainer", structure.pos);

    this.owner = structure;
    this.maxActiveNeeds = 3;

    switch (structure.structureType) {
      case STRUCTURE_CONTAINER:
        this.priority = 25;
        this.maxActiveNeeds = 1;
        break;
      case STRUCTURE_SPAWN:
        this.priority = 1;
        break;
      case STRUCTURE_CONTROLLER:
        this.priority = 30;
        this.maxActiveNeeds = 3;
        break;
    }

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

    Config.debugLog(`*** ${this.hash()} | ${this.worker ? this.worker.name : "None"} | Completion? ${result}`);

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

      Config.debugLog(`TRANSFER RESULT: ${transferResult}. ENERGY LEFT: ${energyLeft}`);

      if (energyLeft < this.worker.carryCapacity) {
        transferResult = this.worker.transfer(this.owner, RESOURCE_ENERGY, energyLeft);
      }

      if (transferResult === ERR_FULL) {
        transferResult = this.worker.transfer(this.owner, RESOURCE_ENERGY, 1);
      }
    }

    if (transferResult === ERR_NOT_IN_RANGE) {
      this.worker.moveTo(this.owner.pos);
      // travelerInstance.travelTo(this.worker, {pos: this.owner.pos});
    }
  }

  private handleHarvest(): void {
    this.getEnergy();
  }

  private checkCompletion(): boolean {
    let currentEnergy = -1;
    let currentTotalEnergy = -1;
    let typedContainer = null;

    if (this.owner === undefined) {
      return true;
    }

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
      case STRUCTURE_TOWER:
        typedContainer = this.owner as StructureTower;

        currentEnergy = typedContainer.energy;
        currentTotalEnergy = typedContainer.energyCapacity;

        return currentEnergy === currentTotalEnergy;
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
