package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.dto.ClassScheduleDTO;
import com.nexanova.trainer_subject_app.scheduling.entity.ClassSchedule;
import com.nexanova.trainer_subject_app.scheduling.repository.ClassScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/class-schedules")
public class ClassScheduleController {

    @Autowired
    private ClassScheduleRepository classScheduleRepo;

    /**
     * GET /api/class-schedules - Get all class schedules
     */
    @GetMapping
    public ResponseEntity<?> getAllClassSchedules() {
        try {
            System.out.println("📥 GET /api/class-schedules - Fetching all class schedules");
            List<ClassSchedule> schedules = classScheduleRepo.findAll();
            System.out.println("✅ Found " + schedules.size() + " class schedules");
            return ResponseEntity.ok(schedules);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching class schedules: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch class schedules",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/class-schedules/{id} - Get single class schedule
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getClassScheduleById(@PathVariable Long id) {
        try {
            System.out.println("📥 GET /api/class-schedules/" + id);
            ClassSchedule schedule = classScheduleRepo.findById(id).orElse(null);
            
            if (schedule == null) {
                System.out.println("❌ Class schedule not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Class schedule not found"));
            }
            
            System.out.println("✅ Class schedule found");
            return ResponseEntity.ok(schedule);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching class schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch class schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/class-schedules - Create new class schedule
     */
    @PostMapping
    public ResponseEntity<?> createClassSchedule(@RequestBody ClassScheduleDTO dto) {
        try {
            System.out.println("📤 POST /api/class-schedules - Creating class schedule");
            System.out.println("Data received: " + dto);
            
            ClassSchedule schedule = new ClassSchedule();
            schedule.setCourseId(dto.getCourseId());
            schedule.setDay(dto.getDay());
            schedule.setStartTime(dto.getStartTime());
            schedule.setEndTime(dto.getEndTime());
            schedule.setRoom(dto.getRoom());
            schedule.setStatus("ACTIVE");
            
            ClassSchedule saved = classScheduleRepo.save(schedule);
            System.out.println("✅ Class schedule created with ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("❌ ERROR creating class schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create class schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * PUT /api/class-schedules/{id} - Update class schedule
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClassSchedule(@PathVariable Long id, @RequestBody ClassScheduleDTO dto) {
        try {
            System.out.println("📤 PUT /api/class-schedules/" + id);
            System.out.println("Data received: " + dto);
            
            ClassSchedule schedule = classScheduleRepo.findById(id).orElse(null);
            
            if (schedule == null) {
                System.out.println("❌ Class schedule not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Class schedule not found"));
            }
            
            // Update fields
            if (dto.getCourseId() != null) schedule.setCourseId(dto.getCourseId());
            if (dto.getDay() != null) schedule.setDay(dto.getDay());
            if (dto.getStartTime() != null) schedule.setStartTime(dto.getStartTime());
            if (dto.getEndTime() != null) schedule.setEndTime(dto.getEndTime());
            if (dto.getRoom() != null) schedule.setRoom(dto.getRoom());
            
            ClassSchedule updated = classScheduleRepo.save(schedule);
            System.out.println("✅ Class schedule updated");
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("❌ ERROR updating class schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to update class schedule",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * DELETE /api/class-schedules/{id} - Delete class schedule
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClassSchedule(@PathVariable Long id) {
        try {
            System.out.println("🗑️ DELETE /api/class-schedules/" + id);
            
            if (!classScheduleRepo.existsById(id)) {
                System.out.println("❌ Class schedule not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Class schedule not found"));
            }
            
            classScheduleRepo.deleteById(id);
            System.out.println("✅ Class schedule deleted");
            return ResponseEntity.ok(Map.of("message", "Class schedule deleted successfully"));
        } catch (Exception e) {
            System.out.println("❌ ERROR deleting class schedule: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to delete class schedule",
                    "details", e.getMessage()
            ));
        }
    }
}
