import { NeedQueue } from "needQueue";
import { NeedGenerator } from "./needGenerator";

import * as Profiler from "screeps-profiler";

export const ENABLE_PROFILER = true;

if (ENABLE_PROFILER) {
  Profiler.enable();
}

delete Memory.creeps;
NeedQueue.clearQueue();

const mainLoop = () => {
  // Main Loop
  NeedGenerator.generateNeeds();
  NeedQueue.doAllJobs();

  console.log("----------------------");
};

export const loop = !ENABLE_PROFILER ? mainLoop : () => { Profiler.wrap(mainLoop); };
