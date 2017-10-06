import { Need } from "need";
import { BuildNeed } from "needs/buildNeed";
import { CreepNeed } from "needs/creepNeed";
import { FillContainerNeed } from "needs/fillContainerNeed";

export const MAX_CREEPS = 8;

export const MAIN_SPAWN = "Spawn1";

export const DEBUG = false;

export const ROOM_NAME = "W7N3";

export const MY_ROOM = Game.rooms[ROOM_NAME];

export class NeedGenerator {
  // START HERE - This is where you should focus
  // when trying to understand the overall flow.
  public static generateNeeds(): void {
    this.ensureCreepCount();
    this.fillEmptyContainers();
    this.findConstructionSites();
  }

  private static ensureCreepCount(): CreepNeed[] {
    const count = this.getCreepsCount();
    const needs = new Array<CreepNeed>();

    // Do we need creeps?
    if (count < MAX_CREEPS) {
      const mainSpawn = Game.spawns[MAIN_SPAWN];
      needs.push(new CreepNeed(mainSpawn));
    }

    return needs;
  }

  private static getCreepsCount(): number {
    return Object.keys(Game.creeps).length;
  }

  private static findConstructionSites(): Need[] {
    const needs = new Array<Need>();

    for (const key in Game.constructionSites) {
      const site: ConstructionSite = Game.constructionSites[key];

      if (site.progress < site.progressTotal) {
        needs.push(new BuildNeed(site));
      }
    }

    return needs;
  }

  private static fillEmptyContainers(): Need[] {
    const options = {
      filter: (item: Structure) => item.structureType === STRUCTURE_SPAWN ||
        item.structureType === STRUCTURE_EXTENSION ||
        item.structureType === STRUCTURE_CONTAINER // ||
        // item.structureType === STRUCTURE_CONTROLLER
    };

    const energyContainers = MY_ROOM.find(FIND_MY_STRUCTURES, options);
    const needsGenerated: Need[] = new Array<Need>();

    for ( const container of energyContainers) {

      let currentEnergy = -1;
      let currentTotalEnergy = -1;
      let typedContainer = null;

      switch ((container as Structure).structureType) {
        case STRUCTURE_CONTAINER:
          typedContainer = container as StructureContainer;

          currentEnergy = _.sum(typedContainer.store);
          currentTotalEnergy = typedContainer.storeCapacity;
          break;
        case STRUCTURE_EXTENSION:
          typedContainer = container as StructureExtension;

          currentEnergy = typedContainer.energy;
          currentTotalEnergy = typedContainer.energyCapacity;
          break;
        case STRUCTURE_SPAWN:
          typedContainer = container as StructureSpawn;

          currentEnergy = typedContainer.energy;
          currentTotalEnergy = typedContainer.energyCapacity;
          break;
        case STRUCTURE_CONTROLLER:
          typedContainer = container as StructureController;

          currentEnergy = typedContainer.progress;
          currentTotalEnergy = typedContainer.progressTotal;
      }

      if (typedContainer) {
        if (currentEnergy < currentTotalEnergy) {
          needsGenerated.push(new FillContainerNeed(typedContainer));
        }
      }
    }

    return needsGenerated;
  }

  public creeps: Creep[];
}
