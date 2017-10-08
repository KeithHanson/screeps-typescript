import { NeedQueue } from "needQueue";
import { NeedGenerator } from "./needGenerator";

import * as Profiler from "screeps-profiler";

import * as Config from "./config";

export const ENABLE_PROFILER = false;

if (ENABLE_PROFILER) {
  Profiler.enable();
}

delete Memory.creeps;
NeedQueue.clearQueue();

const mainLoop = () => {
  // Main Loop
  NeedGenerator.generateNeeds();
  NeedQueue.doAllJobs();

  handleTowerLogic();

  console.log("----------------------");
};

const handleTowerLogic = () => {
  const structures: Structure[] = Config.MY_ROOM.find(FIND_MY_STRUCTURES) as Structure[];

  const towers = structures.filter( (structure: Structure, _index: number, _array: Structure[]) => {
    return structure.structureType === STRUCTURE_TOWER;
  } ) as StructureTower[];

  for (const tower of towers) {
    const closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure: Structure) => structure.hits < structure.hitsMax
    }) as Structure;

    if (closestDamagedStructure) {
        tower.repair(closestDamagedStructure);
    }

    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS) as Creep;
    if (closestHostile) {
        tower.attack(closestHostile);
    }

  }
};

export const loop = !ENABLE_PROFILER ? mainLoop : () => { Profiler.wrap(mainLoop); };
