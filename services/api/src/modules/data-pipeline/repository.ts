import type { ContentUnit, InteractionLog } from "./types.js";

export function createDataPipelineRepository() {
  const contentUnits: ContentUnit[] = [];
  const interactionLogs: InteractionLog[] = [];

  return {
    saveContentUnit(unit: ContentUnit) {
      contentUnits.push(unit);
      return unit;
    },
    listContentUnits() {
      return [...contentUnits];
    },
    saveInteractionLog(log: InteractionLog) {
      interactionLogs.push(log);
      return log;
    },
    listInteractionLogs(studentId: string) {
      return interactionLogs.filter((log) => log.studentId === studentId);
    },
  };
}
