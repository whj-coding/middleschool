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
    findContentUnit(unitId: string) {
      return contentUnits.find((unit) => unit.id === unitId);
    },
    updateContentUnit(unit: ContentUnit) {
      const index = contentUnits.findIndex((item) => item.id === unit.id);
      if (index === -1) return undefined;
      contentUnits[index] = unit;
      return unit;
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
