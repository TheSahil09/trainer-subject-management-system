package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.Course;
import com.nexanova.trainer_subject_app.scheduling.entity.Enrollment;
import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.repository.CourseRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.EnrollmentRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

record EnrollRequest(Long courseId) {}
    record AdminEnrollRequest(Long studentId, Long courseId) {}
    record BulkEnrollRequest(java.util.List<Long> studentIds, Long courseId) {}
@RestController
@RequestMapping({"/api/enrollments", "/api/enrollment"}) // support both plural and singular forms
@CrossOrigin(origins = "http://localhost:3000")
public class EnrollmentController {

    @Autowired private EnrollmentRepository enrollmentRepo;
    @Autowired private CourseRepository courseRepo;
    @Autowired private UserRepository userRepo;

    // STUDENT enrolls in course
    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody EnrollRequest req,
                                    HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        String email = (String) request.getAttribute("userEmail");

        System.out.println("DEBUG ENROLL - Role: '" + role + "', Email: '" + email + "'");  // added afterwards

        if (!"STUDENT".equalsIgnoreCase(role)){// new fixed
            return ResponseEntity.status(403).body("Only STUDENTS can enroll. Debug: "+role);
        }

        User student = userRepo.findByEmail(email).orElse(null);
        if (student == null) {
            return ResponseEntity.badRequest().body("Student not found");
        }

        Course course = courseRepo.findById(req.courseId()).orElse(null);
        if (course == null) {
            return ResponseEntity.badRequest().body("Course not found");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollmentRepo.save(enrollment);

        return ResponseEntity.ok("Enrolled successfully");
    }

    // Student sees their enrollments
    @GetMapping
    public ResponseEntity<?> getMyEnrollments(HttpServletRequest request) {
        try {
            String email = (String) request.getAttribute("userEmail");
            String role = (String) request.getAttribute("userRole");
            
            System.out.println("📥 GET /api/enrollments - Email: " + email + ", Role: " + role);
            
            if (email == null) {
                System.out.println("❌ No email in request attributes");
                return ResponseEntity.status(401).body("User not authenticated");
            }
            
            User student = userRepo.findByEmail(email).orElse(null);
            if (student == null) {
                System.out.println("❌ Student not found for email: " + email);
                return ResponseEntity.ok(List.of()); // Return empty list if student not found
            }

            List<Enrollment> enrollments = enrollmentRepo.findByStudent(student);
            System.out.println("✅ Found " + enrollments.size() + " enrollments for " + email);
            return ResponseEntity.ok(enrollments);
            
        } catch (Exception e) {
            System.out.println("❌ ERROR in getMyEnrollments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error fetching enrollments: " + e.getMessage());
        }
    }

    // ============= ADMIN ENDPOINTS =============

    /**
     * POST /api/enrollments/bulk-enroll (also available at /api/enrollment/bulk-enroll)
     * Bulk enroll multiple students into a single course. ADMIN only.
     */
    @PostMapping("/bulk-enroll")
    public ResponseEntity<?> bulkEnroll(@RequestBody BulkEnrollRequest req,
                                        HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("userRole");
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            System.out.println("📤 POST /api/enrollments/bulk-enroll - Role attr: " + role);
            System.out.println("    Authorities: " + auth.getAuthorities());

            boolean isAdmin = role != null && role.equalsIgnoreCase("ADMIN");
            if (!isAdmin) {
                isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            }
            if (!isAdmin) {
                System.out.println("❌ Access denied - only ADMIN can bulk enroll");
                return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can perform bulk enroll"));
            }

            Course course = courseRepo.findById(req.courseId()).orElse(null);
            if (course == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }

            int created = 0;
            for (Long sid : req.studentIds()) {
                User student = userRepo.findById(sid).orElse(null);
                if (student == null) {
                    System.out.println("⚠️ Student id not found: " + sid);
                    continue;
                }
                List<Enrollment> existing = enrollmentRepo.findByStudent(student);
                boolean already = existing.stream()
                        .anyMatch(e -> e.getCourse().getId().equals(req.courseId()));
                if (already) continue;

                Enrollment enrollment = new Enrollment();
                enrollment.setStudent(student);
                enrollment.setCourse(course);
                enrollmentRepo.save(enrollment);
                created++;
            }

            System.out.println("✅ Bulk enroll completed, created " + created + " records");
            return ResponseEntity.ok(Map.of("count", created));
        } catch (Exception e) {
            System.out.println("❌ ERROR in bulkEnroll: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/enrollments/admin/all - Admin views ALL enrollments
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllEnrollmentsAdmin(HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("userRole");
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            System.out.println("📥 GET /api/enrollments/admin/all - Role attr: " + role);
            System.out.println("    Security auth: " + auth);
            System.out.println("    Authorities: " + auth.getAuthorities());
            
            boolean isAdmin = false;
            if (role != null && role.equalsIgnoreCase("ADMIN")) {
                isAdmin = true;
            }
            if (!isAdmin) {
                // also check authorities
                isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            }

            if (!isAdmin) {
                System.out.println("❌ Access denied - not an admin");
                return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can access this endpoint"));
            }

            List<Enrollment> allEnrollments = enrollmentRepo.findAll();
            System.out.println("✅ Found " + allEnrollments.size() + " total enrollments");
            return ResponseEntity.ok(allEnrollments);
            
        } catch (Exception e) {
            System.out.println("❌ ERROR in getAllEnrollmentsAdmin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/enrollments/admin/enroll - Admin enrolls ANY student in a course
     */
    @PostMapping("/admin/enroll")
    public ResponseEntity<?> enrollStudentAsAdmin(@RequestBody AdminEnrollRequest req,
                                                   HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("userRole");
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            System.out.println("📤 POST /api/enrollments/admin/enroll - Role attr: " + role);
            System.out.println("    Security auth: " + auth);
            System.out.println("    Authorities: " + auth.getAuthorities());
            System.out.println("   StudentID: " + req.studentId() + ", CourseID: " + req.courseId());
            
            boolean isAdmin = role != null && role.equalsIgnoreCase("ADMIN");
            if (!isAdmin) {
                isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            }
            if (!isAdmin) {
                System.out.println("❌ Access denied - not an admin");
                return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can enroll students"));
            }

            // Find student
            User student = userRepo.findById(req.studentId()).orElse(null);
            if (student == null) {
                System.out.println("❌ Student not found: " + req.studentId());
                return ResponseEntity.status(404).body(Map.of("error", "Student not found"));
            }

            // Find course
            Course course = courseRepo.findById(req.courseId()).orElse(null);
            if (course == null) {
                System.out.println("❌ Course not found: " + req.courseId());
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }

            // Check if already enrolled
            List<Enrollment> existing = enrollmentRepo.findByStudent(student);
            if (existing.stream().anyMatch(e -> e.getCourse().getId().equals(req.courseId()))) {
                System.out.println("❌ Student already enrolled in this course");
                return ResponseEntity.status(400).body(Map.of("error", "Student already enrolled in this course"));
            }

            // Create enrollment
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setCourse(course);
            Enrollment saved = enrollmentRepo.save(enrollment);
            
            System.out.println("✅ Enrollment created - ID: " + saved.getId());
            return ResponseEntity.ok(Map.of(
                "message", "Student enrolled successfully",
                "enrollmentId", saved.getId()
            ));
            
        } catch (Exception e) {
            System.out.println("❌ ERROR in enrollStudentAsAdmin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/enrollments/{id} - Admin or Student can delete enrollment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEnrollment(@PathVariable Long id,
                                             HttpServletRequest request) {
        try {
            String role = (String) request.getAttribute("userRole");
            String email = (String) request.getAttribute("userEmail");
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🗑️ DELETE /api/enrollments/" + id + " - Role attr: " + role + ", Email: " + email);
            System.out.println("    Security auth: " + auth);
            System.out.println("    Authorities: " + auth.getAuthorities());
            
            Enrollment enrollment = enrollmentRepo.findById(id).orElse(null);
            if (enrollment == null) {
                System.out.println("❌ Enrollment not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Enrollment not found"));
            }

            // Admin can delete any enrollment, student can only delete their own
            boolean isAdmin = role != null && role.equalsIgnoreCase("ADMIN");
            if (!isAdmin) {
                isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            }
            if ("STUDENT".equalsIgnoreCase(role) || auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
                User student = userRepo.findByEmail(email).orElse(null);
                if (student == null || !student.getId().equals(enrollment.getStudent().getId())) {
                    System.out.println("❌ Access denied - student cannot delete other enrollments");
                    return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
                }
            } else if (!isAdmin) {
                System.out.println("❌ Access denied - only admin or student can delete");
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            enrollmentRepo.deleteById(id);
            System.out.println("✅ Enrollment deleted");
            return ResponseEntity.ok(Map.of("message", "Enrollment deleted successfully"));
            
        } catch (Exception e) {
            System.out.println("❌ ERROR in deleteEnrollment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
