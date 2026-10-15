package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.entity.Trainer;
import com.nexanova.trainer_subject_app.repository.TrainerRepository;
import com.nexanova.trainer_subject_app.scheduling.entity.Course;
import com.nexanova.trainer_subject_app.scheduling.entity.Enrollment;
import com.nexanova.trainer_subject_app.scheduling.entity.Module;
import com.nexanova.trainer_subject_app.scheduling.entity.Schedule;
import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.repository.CourseRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.EnrollmentRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.ModuleRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.ScheduleRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping({"/api/schedules", "/api/schedule"}) // support both plural and singular for legacy/docs
public class ScheduleController {

    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private CourseRepository courseRepository;

    /**
     * GET /api/schedule - Get all schedules
     */
    @GetMapping
    public ResponseEntity<?> getAllSchedules() {
        try {
            System.out.println("════════════════════════════════════════════");
            System.out.println("📥 GET /api/schedule - Fetching all schedules");
            System.out.println("════════════════════════════════════════════");
            
            List<Schedule> schedules = scheduleRepo.findAll();
            System.out.println("✅ Found " + schedules.size() + " schedules");
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching schedules: " + e.getMessage());
            e.printStackTrace();
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch schedules",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/schedule/{id} - Get single schedule
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getScheduleById(@PathVariable Long id) {
        try {
            System.out.println("📥 GET /api/schedule/" + id);
            Schedule schedule = scheduleRepo.findById(id).orElse(null);
            
            if (schedule == null) {
                System.out.println("❌ Schedule not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Schedule not found"));
            }
            
            System.out.println("✅ Schedule found");
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/schedule - Create new schedule
     */
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody Schedule scheduleData) {
        try {
            System.out.println("📤 POST /api/schedule - Creating schedule");
            Schedule saved = scheduleRepo.save(scheduleData);
            System.out.println("✅ Schedule created with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("❌ ERROR creating schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * PUT /api/schedule/{id} - Update schedule
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long id,
                                           @RequestBody Schedule scheduleData) {
        try {
            System.out.println("📤 PUT /api/schedule/" + id);
            Schedule schedule = scheduleRepo.findById(id).orElse(null);
            
            if (schedule == null) {
                System.out.println("❌ Schedule not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Schedule not found"));
            }
            
            // Update fields
            if (scheduleData.getWeekStart() != null) schedule.setWeekStart(scheduleData.getWeekStart());
            if (scheduleData.getDayOfWeek() > 0) schedule.setDayOfWeek(scheduleData.getDayOfWeek());
            if (scheduleData.getSlot() > 0) schedule.setSlot(scheduleData.getSlot());
            if (scheduleData.getStatus() != null) schedule.setStatus(scheduleData.getStatus());
            
            Schedule updated = scheduleRepo.save(schedule);
            System.out.println("✅ Schedule updated");
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("❌ ERROR updating schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to update schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * DELETE /api/schedule/{id} - Delete schedule
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        try {
            System.out.println("🗑️ DELETE /api/schedule/" + id);
            
            if (!scheduleRepo.existsById(id)) {
                System.out.println("❌ Schedule not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Schedule not found"));
            }
            
            scheduleRepo.deleteById(id);
            System.out.println("✅ Schedule deleted");
            return ResponseEntity.ok(Map.of("message", "Schedule deleted successfully"));
        } catch (Exception e) {
            System.out.println("❌ ERROR deleting schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to delete schedule",
                    "details", e.getMessage()
            ));
        }
    }

    // ADMIN: Create blank weekly schedule (28 slots)
    @PostMapping("/create-blank")
    public ResponseEntity<?> createBlankSchedule(@RequestBody Map<String, String> req) {
        try {
            System.out.println("📤 POST /api/schedule/create-blank");
            String weekStartStr = req.get("weekStart");

            if (weekStartStr == null || weekStartStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "weekStart is required"));
            }

            LocalDate weekStart = LocalDate.parse(weekStartStr);

            // Delete ALL existing schedules so there is only ever 1 week at a time
            scheduleRepo.deleteAll();

            // Create 7 days × 4 slots = 28 empty slots for the single week
            for (int day = 1; day <= 7; day++) {
                for (int slot = 1; slot <= 4; slot++) {
                    Schedule schedule = new Schedule();
                    schedule.setWeekStart(weekStart);
                    schedule.setDayOfWeek(day);
                    schedule.setSlot(slot);
                    schedule.setStatus("AVAILABLE");
                    scheduleRepo.save(schedule);
                }
            }

            System.out.println("✅ Blank schedule created for week: " + weekStart);
            return ResponseEntity.ok(Map.of(
                    "message", "Blank schedule created for week starting " + weekStart,
                    "totalSlots", 28
            ));
        } catch (Exception e) {
            System.out.println("❌ ERROR creating blank schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create blank schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * PUT /api/schedule/slot/{slotId} - Assign trainer + subject to slot
     */
    @Autowired
    private jakarta.servlet.http.HttpServletRequest request;

    @PutMapping("/slot/{slotId}")
    public ResponseEntity<?> assignSlot(@PathVariable Long slotId,
                                        @RequestBody Map<String, Long> req) {
        try {
            System.out.println("📤 PUT /api/schedule/slot/" + slotId);
            // log security context for debugging
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            System.out.println("   -> Authenticated principal=" + auth.getPrincipal() + " authorities=" + auth.getAuthorities());
            System.out.println("   -> Request attribute userRole=" + request.getAttribute("userRole"));
            Schedule slot = scheduleRepo.findById(slotId).orElse(null);
            if (slot == null || !"AVAILABLE".equals(slot.getStatus())) {
                System.out.println("❌ Slot not available: " + slotId);
                return ResponseEntity.badRequest().body(Map.of("error", "Slot not available"));
            }

            slot.setTrainerId(req.get("trainerId"));
            slot.setModuleId(req.get("moduleId"));
            slot.setStatus("ASSIGNED");
            scheduleRepo.save(slot);

            System.out.println("✅ Slot assigned");
            return ResponseEntity.ok(Map.of("message", "Slot assigned successfully"));
        } catch (Exception e) {
            System.out.println("❌ ERROR assigning slot: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to assign slot",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/schedule/week/{weekStart} - View schedule for week
     */
    @GetMapping("/week/{weekStart}")
    public ResponseEntity<?> getScheduleForWeek(@PathVariable LocalDate weekStart) {
        try {
            System.out.println("📥 GET /api/schedule/week/" + weekStart);
            List<Schedule> slots = scheduleRepo.findByWeekStart(weekStart);
            System.out.println("✅ Found " + slots.size() + " slots for week");
            return ResponseEntity.ok(slots);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching week schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/schedule/student/{studentId} - Personal timetable
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getStudentTimetable(@PathVariable Long studentId,
                                                 @RequestParam(required = false) String weekStart) {
        try {
            Long effectiveStudentId = studentId;
            String callerRole = (String) request.getAttribute("userRole");
            String callerEmail = (String) request.getAttribute("userEmail");

            if (callerRole != null && callerRole.equalsIgnoreCase("STUDENT")) {
                User self = callerEmail == null ? null : userRepository.findByEmail(callerEmail).orElse(null);
                if (self == null) {
                    return ResponseEntity.status(403).body(Map.of("error", "Student identity not resolved"));
                }
                effectiveStudentId = self.getId();
            }

            User student = userRepository.findById(effectiveStudentId).orElse(null);
            if (student == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
            Set<Long> enrolledCourseIds = enrollments.stream()
                    .filter(enrollment -> enrollment.getCourse() != null)
                    .filter(enrollment -> enrollment.getStatus() != Enrollment.Status.DROPPED)
                    .map(enrollment -> enrollment.getCourse().getId())
                    .collect(Collectors.toSet());

            Set<Long> allowedModuleIds = moduleRepository.findAll().stream()
                    .filter(module -> module.getCourse() != null)
                    .map(module -> (Module) module)
                    .filter(module -> enrolledCourseIds.contains(module.getCourse().getId()))
                    .map(Module::getId)
                    .collect(Collectors.toSet());

            System.out.println("📥 GET /api/schedule/student/" + studentId + " (effective=" + effectiveStudentId + ")");
            System.out.println("Week Start: " + weekStart);

            List<Schedule> assignedSlots;
            if (weekStart != null && !weekStart.isEmpty()) {
                LocalDate weekDate = LocalDate.parse(weekStart);
                assignedSlots = scheduleRepo.findByWeekStartAndStatus(weekDate, "ASSIGNED");
            } else {
                assignedSlots = scheduleRepo.findByStatus("ASSIGNED");
            }

            List<Schedule> filteredSlots = assignedSlots.stream()
                    .filter(slot -> slot.getModuleId() != null && allowedModuleIds.contains(slot.getModuleId()))
                    .collect(Collectors.toList());
            
            System.out.println("✅ Found " + filteredSlots.size() + " assigned slots for student");

            // Build lookup maps for trainer and module names
            Map<Long, String> trainerNameById = new HashMap<>();
            Map<Long, String> moduleNameById = new HashMap<>();
            Map<Long, Long> moduleIdToCourseId = new HashMap<>();
            Map<Long, String> courseIdToTrainerName = new HashMap<>();
            
            try {
                List<Trainer> allTrainers = trainerRepository.findAll();
                for (Trainer trainer : allTrainers) {
                    if (trainer.getId() != null && trainer.getName() != null) {
                        trainerNameById.put(trainer.getId(), trainer.getName());
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Could not load trainers: " + e.getMessage());
            }
            
            try {
                List<Module> allModules = moduleRepository.findAll();
                for (Module module : allModules) {
                    if (module.getId() != null && module.getName() != null) {
                        moduleNameById.put(module.getId(), module.getName());
                    }
                    // Map moduleId -> courseId for later fallback lookup
                    if (module.getId() != null && module.getCourse() != null && module.getCourse().getId() != null) {
                        moduleIdToCourseId.put(module.getId(), module.getCourse().getId());
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Could not load modules: " + e.getMessage());
            }
            
            try {
                List<Course> allCourses = courseRepository.findAllWithTrainer();
                for (Course course : allCourses) {
                    // If course has a trainer assigned, map courseId -> trainer name
                    if (course.getId() != null && course.getTrainer() != null && course.getTrainer().getName() != null) {
                        courseIdToTrainerName.put(course.getId(), course.getTrainer().getName());
                    }
                }
            } catch (Exception e) {
                System.out.println("⚠️ Could not load courses: " + e.getMessage());
            }
            
            // Enrich schedules with trainer and module names
            List<Map<String, Object>> enrichedSchedules = filteredSlots.stream().map(slot -> {
                Map<String, Object> enriched = new HashMap<>();
                enriched.put("id", slot.getId());
                enriched.put("weekStart", slot.getWeekStart());
                enriched.put("dayOfWeek", slot.getDayOfWeek());
                enriched.put("slot", slot.getSlot());
                enriched.put("trainerId", slot.getTrainerId());
                
                // Determine trainer name: first try direct trainerId, then fallback to course trainer
                String trainerName = "TBA";
                if (slot.getTrainerId() != null && slot.getTrainerId() > 0) {
                    trainerName = trainerNameById.getOrDefault(slot.getTrainerId(), "TBA");
                } else {
                    // Fallback: look up course trainer via moduleId -> courseId mapping
                    Long courseId = moduleIdToCourseId.get(slot.getModuleId());
                    if (courseId != null) {
                        trainerName = courseIdToTrainerName.getOrDefault(courseId, "TBA");
                    }
                }
                enriched.put("trainerName", trainerName);
                
                enriched.put("moduleId", slot.getModuleId());
                enriched.put("moduleName", moduleNameById.getOrDefault(slot.getModuleId(), "Module #" + slot.getModuleId()));
                enriched.put("status", slot.getStatus());
                return enriched;
            }).collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("studentId", effectiveStudentId);
            response.put("weekStart", weekStart);
            response.put("totalAssignedSlots", enrichedSchedules.size());
            response.put("timetable", enrichedSchedules);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching student timetable: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch timetable");
            error.put("details", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }







    /**
 * GET /api/schedules/trainer/{trainerId} - Trainer timetable
 */
@GetMapping("/trainer/{trainerId}")
public ResponseEntity<?> getTrainerTimetable(@PathVariable Long trainerId,
                                             @RequestParam(required = false) String weekStart) {
    try {
        Long effectiveTrainerId = trainerId;
        String callerRole = (String) request.getAttribute("userRole");
        String callerEmail = (String) request.getAttribute("userEmail");

        // For trainer self-view, resolve trainer profile ID by email so schedule matches assigned trainer IDs.
        if (callerRole != null && callerRole.equalsIgnoreCase("TRAINER")
                && callerEmail != null && !callerEmail.isBlank()) {
            Trainer trainer = trainerRepository.findByEmailIgnoreCase(callerEmail).orElse(null);
            if (trainer != null) {
                effectiveTrainerId = trainer.getId();
            }
        }
        
        final Long finalTrainerId = effectiveTrainerId;

        System.out.println("📥 GET /api/schedules/trainer/" + trainerId + " (effective=" + finalTrainerId + ")");
        System.out.println("Week Start: " + weekStart);

        // Fetch schedules: direct trainerId match OR modules from courses assigned to this trainer
        List<Schedule> assignedSlots = new java.util.ArrayList<>();
        
        try {
            // STEP 1: Fetch schedules with direct trainerId match
            if (weekStart != null && !weekStart.isEmpty()) {
                LocalDate weekDate = LocalDate.parse(weekStart);
                assignedSlots.addAll(scheduleRepo
                        .findByTrainerIdAndStatusAndWeekStart(finalTrainerId, "ASSIGNED", weekDate));
            } else {
                assignedSlots.addAll(scheduleRepo
                        .findByTrainerIdAndStatus(finalTrainerId, "ASSIGNED"));
            }
            System.out.println("✓ Direct trainerId matches: " + assignedSlots.size());
            
            // STEP 2: Also include schedules from modules in courses assigned to this trainer
            try {
                List<Course> coursesAssignedToTrainer = courseRepository.findAll().stream()
                        .filter(c -> c.getTrainer() != null && c.getTrainer().getId().equals(finalTrainerId))
                        .collect(java.util.stream.Collectors.toList());
                final Set<Long> courseModuleIds = new java.util.HashSet<>();
                for (Course course : coursesAssignedToTrainer) {
                    List<Module> modules = moduleRepository.findAll().stream()
                            .filter(m -> m.getCourse() != null && m.getCourse().getId().equals(course.getId()))
                            .collect(java.util.stream.Collectors.toList());
                    courseModuleIds.addAll(modules.stream().map(Module::getId).collect(java.util.stream.Collectors.toList()));
                }
                
                if (!courseModuleIds.isEmpty()) {
                    List<Schedule> courseSchedules;
                    if (weekStart != null && !weekStart.isEmpty()) {
                        final LocalDate weekDate = LocalDate.parse(weekStart);
                        courseSchedules = scheduleRepo.findByStatus("ASSIGNED").stream()
                                .filter(s -> s.getWeekStart() != null && s.getWeekStart().equals(weekDate) && courseModuleIds.contains(s.getModuleId()))
                                .collect(java.util.stream.Collectors.toList());
                    } else {
                        courseSchedules = scheduleRepo.findByStatus("ASSIGNED").stream()
                                .filter(s -> courseModuleIds.contains(s.getModuleId()))
                                .collect(java.util.stream.Collectors.toList());
                    }
                    
                    // Add only if not already in list (avoid duplicates)
                    for (Schedule cs : courseSchedules) {
                        if (!assignedSlots.stream().anyMatch(s -> s.getId().equals(cs.getId()))) {
                            assignedSlots.add(cs);
                        }
                    }
                    System.out.println("✓ Course module schedules: " + courseSchedules.size());
                }
            } catch (Exception e) {
                System.out.println("⚠️ Could not fetch course module schedules: " + e.getMessage());
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error fetching schedules: " + e.getMessage());
        }

        System.out.println("✅ Total assigned slots for trainer: " + assignedSlots.size());

        // Build lookup maps for trainer and module names
        Map<Long, String> trainerNameById = new HashMap<>();
        Map<Long, String> moduleNameById = new HashMap<>();
        Map<Long, Long> moduleIdToCourseId = new HashMap<>();
        Map<Long, String> courseIdToTrainerName = new HashMap<>();
        
        try {
            List<Trainer> allTrainers = trainerRepository.findAll();
            for (Trainer trainer : allTrainers) {
                if (trainer.getId() != null && trainer.getName() != null) {
                    trainerNameById.put(trainer.getId(), trainer.getName());
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not load trainers: " + e.getMessage());
        }
        
        try {
            List<Module> allModules = moduleRepository.findAll();
            for (Module module : allModules) {
                if (module.getId() != null && module.getName() != null) {
                    moduleNameById.put(module.getId(), module.getName());
                }
                // Map moduleId -> courseId for later fallback lookup
                if (module.getId() != null && module.getCourse() != null && module.getCourse().getId() != null) {
                    moduleIdToCourseId.put(module.getId(), module.getCourse().getId());
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not load modules: " + e.getMessage());
        }
        
        try {
            List<Course> allCourses = courseRepository.findAll();
            for (Course course : allCourses) {
                // If course has a trainer assigned, map courseId -> trainer name
                if (course.getId() != null && course.getTrainer() != null && course.getTrainer().getName() != null) {
                    courseIdToTrainerName.put(course.getId(), course.getTrainer().getName());
                }
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not load courses: " + e.getMessage());
        }
        
        // Enrich schedules with trainer and module names
        List<Map<String, Object>> enrichedSchedules = assignedSlots.stream().map(slot -> {
            Map<String, Object> enriched = new HashMap<>();
            enriched.put("id", slot.getId());
            enriched.put("weekStart", slot.getWeekStart());
            enriched.put("dayOfWeek", slot.getDayOfWeek());
            enriched.put("slot", slot.getSlot());
            enriched.put("trainerId", slot.getTrainerId());
            
            // Determine trainer name: first try direct trainerId, then fallback to course trainer
            String trainerName = "TBA";
            if (slot.getTrainerId() != null && slot.getTrainerId() > 0) {
                trainerName = trainerNameById.getOrDefault(slot.getTrainerId(), "TBA");
            } else {
                // Fallback: look up course trainer via moduleId -> courseId mapping
                Long courseId = moduleIdToCourseId.get(slot.getModuleId());
                if (courseId != null) {
                    trainerName = courseIdToTrainerName.getOrDefault(courseId, "TBA");
                }
            }
            enriched.put("trainerName", trainerName);
            
            enriched.put("moduleId", slot.getModuleId());
            enriched.put("moduleName", moduleNameById.getOrDefault(slot.getModuleId(), "Module #" + slot.getModuleId()));
            enriched.put("status", slot.getStatus());
            return enriched;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "trainerId", finalTrainerId,
                "totalAssignedSlots", enrichedSchedules.size(),
                "timetable", enrichedSchedules
        ));

    } catch (Exception e) {
        System.out.println("❌ ERROR fetching trainer timetable: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to fetch timetable",
                "details", e.getMessage()
        ));
    }
}









}
