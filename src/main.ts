import { NeedQueue } from "needQueue";
import { NeedGenerator } from "./needGenerator";

export const loop = () => {
  // Main Loop
  NeedGenerator.generateNeeds();
  NeedQueue.doAllJobs();
  Memory.needQueue = NeedQueue.currentQueue;
};
