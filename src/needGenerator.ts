import { CreepNeed } from "needs/creepNeed";

export const MAX_CREEPS = 2;

export const MAIN_SPAWN = "Spawn1";

export class NeedGenerator {
  public static generateNeeds(): void {
    this.checkCreeps();
  }

  private static checkCreeps(): void {
    const count = this.getCreepsCount();

    if (count < MAX_CREEPS) {
      console.log("Attempting to create a new creep need.");

      const mainSpawn = Game.spawns[MAIN_SPAWN];

      console.log(new CreepNeed(mainSpawn));
    }
  }

  private static getCreepsCount(): number {
    return Object.keys(Game.creeps).length;
  }

  public creeps: Creep[];
}
