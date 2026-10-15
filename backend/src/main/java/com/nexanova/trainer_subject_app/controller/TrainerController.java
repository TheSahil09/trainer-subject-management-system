package com.nexanova.trainer_subject_app.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.Course;
import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.entity.Trainer;
import com.nexanova.trainer_subject_app.scheduling.repository.CourseRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import com.nexanova.trainer_subject_app.scheduling.util.PasswordUtil;
import com.nexanova.trainer_subject_app.repository.TrainerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/trainer") //api added
@CrossOrigin(origins = "http://localhost:3000")
public class TrainerController {

    private final TrainerRepository trainerRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository; // to include self-registered trainers
    private final PasswordUtil passwordUtil;

    public TrainerController(TrainerRepository trainerRepository,
                             CourseRepository courseRepository,
                             UserRepository userRepository,
                             PasswordUtil passwordUtil) {
        this.trainerRepository = trainerRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.passwordUtil = passwordUtil;
    }

    // POST /trainer  – add trainer
    @PostMapping
    public ResponseEntity<Trainer> addTrainer(@RequestBody Trainer trainer) {
        // Expect trainer.course.id to be sent from frontend
        if (trainer.getCourse() == null || trainer.getCourse().getId() == null) {
            return ResponseEntity.badRequest().build();
        }

        Course course = courseRepository.findById(trainer.getCourse().getId())
                .orElse(null);

        if (course == null) {
            return ResponseEntity.badRequest().build();
        }

        trainer.setCourse(course);
        Trainer saved = trainerRepository.save(trainer);
        return ResponseEntity.ok(saved);
    }

    // Normalize common email typos (gamil→gmail, etc)
    private String normalizeEmail(String email) {
        if (email == null) return null;
        email = email.trim().toLowerCase();
        email = email.replace("gamil.com", "gmail.com");
        email = email.replace("gmai.com", "gmail.com");
        email = email.replace("gmial.com", "gmail.com");
        return email;
    }

    // GET /trainer – list all trainers (both admin‑added and self‑registered users)
    @GetMapping
    public List<Trainer> getAllTrainers() {
        // STEP 1: Normalize and sync trainer records to users table
        try {
            List<Trainer> persisted = trainerRepository.findAll();
            for (Trainer t : persisted) {
                if (t.getEmail() == null || t.getEmail().isBlank()) continue;

                String originalEmail = t.getEmail().trim().toLowerCase();
                String normalizedEmail = normalizeEmail(originalEmail);
                
                // Update trainer record if email had typo
                if (!originalEmail.equals(normalizedEmail)) {
                    t.setEmail(normalizedEmail);
                    trainerRepository.save(t);
                    System.out.println("✅ Fixed trainer email typo: " + originalEmail + " → " + normalizedEmail);
                }

                // Create or normalize user account
                var existingUser = userRepository.findByEmail(normalizedEmail).orElse(null);
                if (existingUser == null) {
                    User trainerUser = new User();
                    trainerUser.setName(t.getName());
                    trainerUser.setEmail(normalizedEmail);
                    trainerUser.setRole(User.Role.TRAINER);
                    trainerUser.setPassword(passwordUtil.hash("Pass1234"));
                    userRepository.save(trainerUser);
                    System.out.println("✅ Created TRAINER user: " + normalizedEmail);
                } else {
                    boolean changed = false;
                    if (existingUser.getRole() != User.Role.TRAINER) {
                        existingUser.setRole(User.Role.TRAINER);
                        changed = true;
                    }
                    if (!passwordUtil.verify("Pass1234", existingUser.getPassword())) {
                        existingUser.setPassword(passwordUtil.hash("Pass1234"));
                        changed = true;
                    }
                    if (changed) {
                        userRepository.save(existingUser);
                        System.out.println("✅ Normalized TRAINER credentials: " + normalizedEmail);
                    }
                }
            }
        } catch (Exception ex) {
            System.out.println("⚠️ Could not sync trainers to users: " + ex.getMessage());
        }

        List<Trainer> list = trainerRepository.findAll();
        // merge in any users with role TRAINER not yet in the trainers table
        try {
            List<User> users = userRepository.findByRole(User.Role.TRAINER);
            for (User u : users) {
                boolean exists = list.stream()
                        .anyMatch(t -> t.getEmail().equalsIgnoreCase(u.getEmail()));
                if (!exists) {
                    Trainer t = new Trainer();
                    t.setName(u.getName());
                    t.setEmail(u.getEmail());
                    String baseEmpId = "U" + u.getId();
                    String generatedEmpId = baseEmpId;
                    int suffix = 1;
                    while (trainerRepository.findByEmpId(generatedEmpId).isPresent()) {
                        generatedEmpId = baseEmpId + "-" + suffix;
                        suffix++;
                    }
                    t.setEmpId(generatedEmpId);
                    // persist the merged trainer record so it gets a database id
                    try {
                        Trainer saved = trainerRepository.save(t);
                        list.add(saved);
                    } catch (Exception ex) {
                        System.out.println("⚠️ Could not persist merged trainer: " + ex.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            // if userRepository unavailable or other error, ignore
            System.out.println("⚠️ Error merging trainer users: " + e.getMessage());
        }

        // STEP 3: Clean up old/duplicate trainer records (keep only one per normalized email)
        try {
            List<Trainer> finalList = trainerRepository.findAll();
            Map<String, Long> emailToId = new java.util.HashMap<>();
            List<Long> toDelete = new java.util.ArrayList<>();
            
            for (Trainer t : finalList) {
                if (t.getEmail() != null && !t.getEmail().isBlank()) {
                    String normalized = normalizeEmail(t.getEmail());
                    if (emailToId.containsKey(normalized)) {
                        // Duplicate found - keep the first, mark second for deletion
                        toDelete.add(t.getId());
                        System.out.println("🗑️ Marking duplicate trainer for deletion: " + t.getName() + " (" + t.getEmail() + ")");
                    } else {
                        emailToId.put(normalized, t.getId());
                    }
                }
            }
            
            for (Long id : toDelete) {
                trainerRepository.deleteById(id);
                System.out.println("✅ Deleted duplicate trainer record: ID " + id);
            }
            
            list = trainerRepository.findAll();
        } catch (Exception e) {
            System.out.println("⚠️ Error cleaning up duplicates: " + e.getMessage());
        }

        return list;
    }

    // GET /trainer/{id} – get trainer by empId (as in roadmap)
    @GetMapping("/{id}")
    public ResponseEntity<Trainer> getTrainerByEmpId(@PathVariable String id) {
        return trainerRepository.findByEmpId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /trainer/{id} – delete by DB id (primary key)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTrainer(@PathVariable Long id, HttpServletRequest request) {
        // Check admin authorization
        String callerRole = (String) request.getAttribute("userRole");
        if (callerRole == null || !callerRole.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can delete trainers"));
        }

        if (!trainerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // Before deleting, check if trainer is assigned to any courses
            Trainer trainer = trainerRepository.findById(id).orElse(null);
            if (trainer != null && trainer.getCourse() != null) {
                // Unassign the trainer from the course
                trainer.setCourse(null);
                trainerRepository.save(trainer);
                System.out.println("✓ Unassigned trainer from course before deletion");
            }
            
            trainerRepository.deleteById(id);
            System.out.println("✓ Trainer deleted successfully: ID " + id);
            return ResponseEntity.ok(Map.of("message", "Trainer deleted successfully"));
        } catch (Exception e) {
            System.out.println("❌ Error deleting trainer: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete trainer: " + e.getMessage()));
        }
    }

    // GET /trainer/{subject}/topic – list trainers for a subject name
    @GetMapping("/{subject}/topic")
    public List<Trainer> getTrainersBySubject(@PathVariable String subject) {
        return trainerRepository.findByCourse_Name(subject);
    }

    // PUT /api/trainer/{id}/assign-course - assign trainer to course (ADMIN)
    @PutMapping("/{id}/assign-course")
    public ResponseEntity<?> assignCourse(@PathVariable Long id,
                                          @RequestBody Map<String, Long> body,
                                          HttpServletRequest request) {
        String callerRole = (String) request.getAttribute("userRole");
        if (callerRole == null || !callerRole.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can assign trainer course"));
        }

        Long courseId = body.get("courseId");
        if (courseId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "courseId is required"));
        }

        Trainer trainer = trainerRepository.findById(id).orElse(null);
        if (trainer == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Trainer not found"));
        }

        Course course = courseRepository.findById(courseId).orElse(null);
        if (course == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid courseId"));
        }

        trainer.setCourse(course);
        Trainer saved = trainerRepository.save(trainer);
        return ResponseEntity.ok(saved);
    }
}
