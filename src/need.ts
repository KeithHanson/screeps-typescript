import * as Config from "./config";

import { NeedPriorities } from "./needs/needPriorities";

// import {Traveler} from "traveler";

// const travelerInstance = new Traveler();

// A Need is just a job to do.
// This could be creating a new screep, fetching energy to build a structure, healing, etc.
// The hive mind is the central queue of needs and active jobs
export class Need {
  public priority: NeedPriorities;
  public type: string;
  public location: RoomPosition;
  public owner: any;
  public worker: Creep;
  public maxActiveNeeds: number;

  constructor(priority: NeedPriorities, type: string, location: RoomPosition) {
    this.priority = priority;
    this.type = type;
    this.location = location;
    this.maxActiveNeeds = 1;
  }

  public hash(): string {
    return `${this.type}-${this.location.roomName}-${this.location.x}-${this.location.y}`;
  }

  public checkIdleness() {
    const currentXY = `${this.worker.pos.x},${this.worker.pos.y}`;

    if (this.worker.memory.lastXY === undefined) {
      this.worker.memory.lastXY = currentXY;
      this.worker.memory.idleCount = 0;
      return false;
    }

    if (this.worker.memory.lastXY === currentXY) {
      this.worker.memory.idleCount += 1;
      this.worker.say(`IDLE: ${this.worker.memory.idleCount}`);
      Config.debugLog(`${this.worker.name} IDLE INCREASED: ${this.worker.memory.idleCount}`);
    }

    if (this.worker.memory.idleCount >= 5) {
      this.worker.memory.isBusy = false;
      this.worker.memory.idleCount = 0;
    }
  }

  public findWorker(): boolean {
    if (this.worker !== undefined) {
      this.worker = Game.creeps[this.worker.name];
      this.checkIdleness();
      return true;
    }

    const myCreeps = Config.MY_ROOM.find(FIND_MY_CREEPS, {
      filter: (creep: Creep) => creep.memory.isBusy === undefined || creep.memory.isBusy === false
    });

    for (const creep of myCreeps) {
      const typedCreep: Creep = creep as Creep;

      if (typedCreep === undefined) {
        continue;
      }

      if (typedCreep.memory.isBusy === undefined) {
        typedCreep.memory.isBusy = false;
      }

      if (!typedCreep.memory.isBusy) {
        this.worker = typedCreep;
        this.worker.memory.isBusy = true;
        this.worker.memory.isUpgrading = false;
        this.worker.memory.isMiner = false;
        this.worker.memory.isBuilding = false;
        return true;
      }
    }
    return false;
  }

  public doJob(): boolean {
    // Inherited classes should override this
    throw new Error("This call must be implemented by a child class.");
  }

  public getEnergy() {
    if (this.owner.structureType === STRUCTURE_CONTAINER) {
      this.getEnergyFromMiners();
    } else {
      if (!this.getEnergyFromContainers()) {
        this.getEnergyFromMiners();
      }
    }
  }

  private getEnergyFromContainers(): boolean {
    const myStructures = Config.MY_ROOM.find(FIND_STRUCTURES) as Structure[];
    const containers = myStructures.filter((v: Structure, _i: number, _a: Structure[]) => {
      return v.structureType === STRUCTURE_CONTAINER;
    }) as StructureContainer[];

    containers.sort( (a: StructureContainer, b: StructureContainer) => {
      const aEnergy = a.store.energy as number;
      const bEnergy = b.store.energy as number;

      if (aEnergy > bEnergy) {
        return 1;
      } else if (aEnergy < bEnergy) {
        return -1;
      } else {
        return 0;
      }
    }).reverse();

    const bestContainer = containers[0];

    if (bestContainer && this.worker !== undefined && this.worker.memory.isMiner !== true) {
      if (this.worker.withdraw(bestContainer, RESOURCE_ENERGY) !== OK) {
        this.worker.moveTo(bestContainer.pos);
        // travelerInstance.travelTo(this.worker, {pos: bestContainer.pos});
      }

      return true;
    }

    return false;
  }

  private getEnergyFromMiners() {
    const creeps = Config.MY_ROOM.find(FIND_MY_CREEPS) as Creep[];

    const miners = creeps.filter( (creep: Creep) => {
      return creep.memory.isMiner === true;
    } );

    miners.sort ( (a: Creep, b: Creep) => {
      const aEnergy = a.carry.energy as number;
      const bEnergy = b.carry.energy as number;

      if (aEnergy > bEnergy) {
        return 1;
      } else if (aEnergy < bEnergy) {
        return -1;
      } else {
        return 0;
      }
    }).reverse();

    const bestMiner = miners[0];

    if (bestMiner && this.worker !== undefined && this.worker.memory.isMiner !== true) {
      this.worker.moveTo(bestMiner.pos);
      // travelerInstance.travelTo(this.worker, {pos: bestMiner.pos});
    }
  }

}
