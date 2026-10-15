package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.Course;
import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.repository.CourseRepository;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import com.nexanova.trainer_subject_app.scheduling.dto.CourseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/courses - Get all courses (Public endpoint)
     */
    @GetMapping
    public ResponseEntity<?> getAllCourses() {
        try {
            System.out.println("════════════════════════════════════════════");
            System.out.println("📥 GET /api/courses - Fetching all courses");
            System.out.println("════════════════════════════════════════════");
            
            List<Course> courses = courseRepository.findAll();
            System.out.println("✅ Found " + courses.size() + " courses");
            courses.forEach(c -> System.out.println("   - " + c.getId() + ": " + c.getName()));
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching courses:");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch courses",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/courses/{id} - Get single course by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        try {
            System.out.println("📥 GET /api/courses/" + id);
            Course course = courseRepository.findById(id).orElse(null);
            
            if (course == null) {
                System.out.println("❌ Course not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            System.out.println("✅ Course found: " + course.getName());
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            System.out.println("❌ ERROR fetching course " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to fetch course",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/courses - Create new course (ADMIN only)
     */
    @PostMapping
    public ResponseEntity<?> createCourse(@RequestBody CourseDTO dto,
                                          HttpServletRequest request) {
        try {
            System.out.println("════════════════════════════════════════════");
            System.out.println("📤 POST /api/courses - Creating course");
            System.out.println("Course Name: " + dto.getName());
            System.out.println("════════════════════════════════════════════");
            
            String role = (String) request.getAttribute("userRole");
            System.out.println("User Role: " + role);
            
            if (role == null || !role.equals("ADMIN")) {
                System.out.println("❌ Access Denied: Only ADMIN can create courses");
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Only ADMIN can create courses",
                        "userRole", role
                ));
            }
            
            Course course = new Course();
            course.setName(dto.getName());
            course.setCode(dto.getCode());
            course.setDescription(dto.getDescription());
            course.setCredits(dto.getCredits());

            if (dto.getTrainerId() != null) {
                User trainer = userRepository.findById(dto.getTrainerId()).orElse(null);
                if (trainer != null) course.setTrainer(trainer);
            }

            Course saved = courseRepository.save(course);
            System.out.println("✅ Course created with ID: " + saved.getId());
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.out.println("❌ ERROR creating course: " + e.getMessage());
            e.printStackTrace();
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to create course",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * PUT /api/courses/{id} - Update course (ADMIN only)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id,
                                          @RequestBody CourseDTO dto,
                                          HttpServletRequest request) {
        try {
            System.out.println("📤 PUT /api/courses/" + id);
            
            String role = (String) request.getAttribute("userRole");
            if (role == null || !role.equals("ADMIN")) {
                System.out.println("❌ Access Denied");
                return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can update courses"));
            }
            
            Course course = courseRepository.findById(id).orElse(null);
            if (course == null) {
                System.out.println("❌ Course not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            course.setName(dto.getName());
            course.setCode(dto.getCode());
            course.setDescription(dto.getDescription());
            course.setCredits(dto.getCredits());

            if (dto.getTrainerId() != null) {
                User trainer = userRepository.findById(dto.getTrainerId()).orElse(null);
                course.setTrainer(trainer);
            } else {
                course.setTrainer(null);
            }
            
            Course updated = courseRepository.save(course);
            System.out.println("✅ Course updated: " + updated.getName());
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("❌ ERROR updating course: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to update course",
                    "details", e.getMessage()
            ));
        }
    }

    /**
     * DELETE /api/courses/{id} - Delete course (ADMIN only)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id,
                                          HttpServletRequest request) {
        try {
            System.out.println("🗑️ DELETE /api/courses/" + id);
            
            String role = (String) request.getAttribute("userRole");
            if (role == null || !role.equals("ADMIN")) {
                System.out.println("❌ Access Denied");
                return ResponseEntity.status(403).body(Map.of("error", "Only ADMIN can delete courses"));
            }
            
            if (!courseRepository.existsById(id)) {
                System.out.println("❌ Course not found: " + id);
                return ResponseEntity.status(404).body(Map.of("error", "Course not found"));
            }
            
            courseRepository.deleteById(id);
            System.out.println("✅ Course deleted");
            
            return ResponseEntity.ok(Map.of("message", "Course deleted successfully"));
        } catch (Exception e) {
            System.out.println("❌ ERROR deleting course: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Failed to delete course",
                    "details", e.getMessage()
            ));
        }
    }
}
