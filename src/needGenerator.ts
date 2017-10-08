import * as Config from "./config";

import { BuildNeed } from "needs/buildNeed";

import { CreepNeed } from "needs/creepNeed";

import { FillContainerNeed } from "needs/fillContainerNeed";

import { Need } from "need";

import { MinerNeed } from "needs/minerNeed";

export class NeedGenerator {
  // START HERE - This is where you should focus
  // when trying to understand the overall flow.
  public static generateNeeds(): void {
    this.ensureCreepCount();
    this.fillEmptyContainers();
    this.findConstructionSites();

    if (this.getCreepsCount() > 1) {
      this.setMiners();
    }
  }

  private static ensureCreepCount(): CreepNeed[] {
    const count = this.getCreepsCount();
    const needs = new Array<CreepNeed>();

    // Do we need creeps?
    if (count < Config.MAX_CREEPS) {
      needs.push(new CreepNeed(Config.MAIN_SPAWN_OBJECT));
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
    const energyContainers = Config.MY_ROOM.find(FIND_STRUCTURES);
    const needsGenerated: Need[] = new Array<Need>();

    for ( const container of energyContainers) {

      let currentEnergy = -1;
      let currentTotalEnergy = -1;
      let typedContainer = null;

      switch ((container as Structure).structureType) {
        case STRUCTURE_CONTAINER:
          typedContainer = container as StructureContainer;

          currentEnergy = typedContainer.store.energy;
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
        case STRUCTURE_TOWER:
          typedContainer = container as StructureTower;

          currentEnergy = typedContainer.energy;
          currentTotalEnergy = typedContainer.energyCapacity;
          break;
        case STRUCTURE_CONTROLLER:
          typedContainer = container as StructureController;

          currentEnergy = typedContainer.progress;
          currentTotalEnergy = typedContainer.progressTotal;

          Config.debugLog(`Controller Progress: ${currentEnergy}/${currentTotalEnergy}`);
          break;
      }

      if (typedContainer) {
        if (currentEnergy !== currentTotalEnergy) {
          needsGenerated.push(new FillContainerNeed(typedContainer));
        }
      }
    }

    return needsGenerated;
  }

  private static setMiners(): Need[] {
    const needs = new Array<Need>();

    const sources: Source[] = Config.MY_ROOM.find(FIND_SOURCES);

    for (const source of sources) {
      needs.push(new MinerNeed(source));
    }

    return needs;
  }

  public creeps: Creep[];
}
