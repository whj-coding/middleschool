import type { FastifyInstance } from "fastify";

export async function registerAuthRoutes(app: FastifyInstance) {
  let nextStudentNumber = 1;

  app.post("/auth/login", async (request) => {
    const body = request.body as { name?: string };
    const studentId = `student-${nextStudentNumber}`;
    nextStudentNumber += 1;
    return { studentId, name: body.name ?? "张同学" };
  });
}
