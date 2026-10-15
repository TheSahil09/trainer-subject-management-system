package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import com.nexanova.trainer_subject_app.scheduling.util.PasswordUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordUtil passwordUtil;
    
    // GET /api/users - Get all users (optionally filter by role)
    // Example: /api/users?role=STUDENT
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers(@RequestParam(required = false) String role,
                                                  HttpServletRequest request) {
        String callerRole = (String) request.getAttribute("userRole");
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        logger.info("GET /api/users - role filter: " + role + " callerRole=" + callerRole + " authorities=" + auth.getAuthorities());
        // restrict to admin
        boolean isAdmin = callerRole != null && callerRole.equalsIgnoreCase("ADMIN");
        if (!isAdmin) {
            isAdmin = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        }
        if (!isAdmin) {
            logger.warn("Access denied to getAllUsers for non-admin");
            return ResponseEntity.status(403).body(null);
        }
        try {
            List<User> users;
            if (role != null && !role.isEmpty()) {
                try {
                    User.Role roleEnum = User.Role.valueOf(role.toUpperCase());
                    users = userRepository.findByRole(roleEnum);
                    logger.info("Found " + users.size() + " users with role: " + role);
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid role provided: " + role);
                    return ResponseEntity.badRequest().build();
                }
            } else {
                users = userRepository.findAll();
                logger.info("Found " + users.size() + " total users");
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error fetching users", e);
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // GET /api/users/{id} - Get single user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        logger.info("GET /api/users/" + id);
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                logger.info("User found: " + user.get().getEmail());
                return ResponseEntity.ok(user.get());
            }
            logger.warn("User not found with id: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error fetching user " + id, e);
            return ResponseEntity.status(500).build();
        }
    }
    
    // POST /api/users - Create new user
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        logger.info("POST /api/users - Creating user: " + user.getEmail());
        try {
            if (user.getId() != null && userRepository.existsById(user.getId())) {
                logger.warn("Cannot create user. ID already exists: " + user.getId());
                return ResponseEntity.badRequest().build();
            }

            if (user.getEmail() == null || user.getEmail().isBlank()) {
                logger.warn("Cannot create user without email");
                return ResponseEntity.badRequest().build();
            }

            if (userRepository.findByEmail(user.getEmail().trim().toLowerCase()).isPresent()) {
                logger.warn("Cannot create user. Email already exists: " + user.getEmail());
                return ResponseEntity.badRequest().build();
            }

            if (user.getPassword() == null || user.getPassword().isBlank()) {
                logger.warn("Cannot create user without password: " + user.getEmail());
                return ResponseEntity.badRequest().build();
            }

            user.setEmail(user.getEmail().trim().toLowerCase());

            user.setPassword(passwordUtil.hash(user.getPassword()));
            User savedUser = userRepository.save(user);
            logger.info("User created with id: " + savedUser.getId());
            return ResponseEntity.status(201).body(savedUser);
        } catch (Exception e) {
            logger.error("Error creating user", e);
            return ResponseEntity.status(500).build();
        }
    }
    
    // PUT /api/users/{id} - Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        logger.info("PUT /api/users/" + id);
        try {
            Optional<User> existingUser = userRepository.findById(id);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                if (userDetails.getName() != null) user.setName(userDetails.getName());
                if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
                if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
                if (userDetails.getPassword() != null && !userDetails.getPassword().isBlank()) {
                    user.setPassword(passwordUtil.hash(userDetails.getPassword()));
                }
                User updated = userRepository.save(user);
                logger.info("User updated: " + id);
                return ResponseEntity.ok(updated);
            }
            logger.warn("User not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating user " + id, e);
            return ResponseEntity.status(500).build();
        }
    }
    
    // DELETE /api/users/{id} - Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        logger.info("DELETE /api/users/" + id);
        try {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                logger.info("User deleted: " + id);
                return ResponseEntity.noContent().build();
            }
            logger.warn("User not found: " + id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error deleting user " + id, e);
            return ResponseEntity.status(500).build();
        }
    }




    // GET /api/users/students - Get all students
@GetMapping("/students")
public ResponseEntity<List<User>> getAllStudents(HttpServletRequest request) {
    String callerRole = (String) request.getAttribute("userRole");
    var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
    logger.info("GET /api/users/students callerRole=" + callerRole + " authorities=" + auth.getAuthorities());
    // restrict to admin
    boolean isAdmin = callerRole != null && callerRole.equalsIgnoreCase("ADMIN");
    if (!isAdmin) {
        isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
    if (!isAdmin) {
        logger.warn("Access denied to getAllStudents for non-admin");
        return ResponseEntity.status(403).body(null);
    }
    try {
        List<User> students = userRepository.findByRole(User.Role.STUDENT);
        logger.info("Found " + students.size() + " students");
        return ResponseEntity.ok(students);
    } catch (Exception e) {
        logger.error("Error fetching students", e);
        return ResponseEntity.status(500).build();
    }
}




}





