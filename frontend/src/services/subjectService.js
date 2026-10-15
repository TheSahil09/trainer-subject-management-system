import { courseService } from "./courseService";

// Backwards-compatible adapter: keep legacy `subjectService` API but forward to `courseService`.
export const subjectService = {
  getAll: courseService.getAll,
  getById: courseService.getById,
  create: courseService.create,
  update: courseService.update,
  delete: courseService.delete,
};
