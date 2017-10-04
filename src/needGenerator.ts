import { CreepNeed } from "needs/creepNeed";
import { FillContainerNeed } from "needs/fillContainerNeed";

export const MAX_CREEPS = 3;

export const MAIN_SPAWN = "Spawn1";

export const DEBUG = false;

export const ROOM_NAME = "W7N7";

export const MY_ROOM = Game.rooms[ROOM_NAME];

export class NeedGenerator {
  // START HERE - This is where you should focus
  // when trying to understand the overall flow.
  public static generateNeeds(): void {
    this.ensureCreepCount();
    this.fillEmptyContainers();
  }

  private static ensureCreepCount(): void {
    const count = this.getCreepsCount();

    // Do we need creeps?
    if (count < MAX_CREEPS) {
      console.log("Attempting to create a new creep need.");

      const mainSpawn = Game.spawns[MAIN_SPAWN];
      new CreepNeed(mainSpawn);
    }
  }

  private static getCreepsCount(): number {
    return Object.keys(Game.creeps).length;
  }

  private static fillEmptyContainers(): void {
    const options = {
      filter: (item: Structure) => item.structureType === STRUCTURE_SPAWN ||
        item.structureType === STRUCTURE_EXTENSION ||
        item.structureType === STRUCTURE_CONTAINER
    };

    const energyContainers = MY_ROOM.find(FIND_MY_STRUCTURES, options);

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
      }

      if (typedContainer) {
        if (currentEnergy < currentTotalEnergy) {
          console.log(`Trying to create FillContainerNeed for ${typedContainer.id}.`);
          new FillContainerNeed(typedContainer);
        }
      }
    }
  }

  public creeps: Creep[];
}
