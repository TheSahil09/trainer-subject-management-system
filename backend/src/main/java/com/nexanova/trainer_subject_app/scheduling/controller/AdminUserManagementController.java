package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import com.nexanova.trainer_subject_app.scheduling.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

/**
 * Admin endpoints for user management with proper password hashing
 * Ensures that when admin adds users with temporary passwords,
 * those passwords are correctly BCrypt hashed
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserManagementController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordUtil passwordUtil;

    /**
     * Create a new user with a temporary password (ADMIN only)
     * The password will be BCrypt hashed before storage
     * 
     * Request Body:
     * {
     *   "name": "Rushi Trainer",
     *   "email": "rushi@gmail.com",
     *   "temporaryPassword": "123456",
     *   "role": "TRAINER"
     * }
     */
    @PostMapping("/create-with-temp-password")
    public ResponseEntity<?> createUserWithTemporaryPassword(@RequestBody CreateUserRequest req) {
        try {
            System.out.println("════════════════════════════════════════════");
            System.out.println("📝 ADMIN: Create user with temporary password");
            System.out.println("════════════════════════════════════════════");
            System.out.println("Name: " + req.name);
            System.out.println("Email: " + req.email);
            System.out.println("Temp Password Length: " + (req.temporaryPassword != null ? req.temporaryPassword.length() : 0));
            System.out.println("Role: " + req.role);
            System.out.println("════════════════════════════════════════════\n");

            // Validate inputs
            if (req.name == null || req.name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Name is required"
                ));
            }

            if (req.email == null || req.email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email is required"
                ));
            }

            if (req.temporaryPassword == null || req.temporaryPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Temporary password is required"
                ));
            }

            if (req.role == null || req.role.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Role is required (STUDENT, TRAINER, or ADMIN)"
                ));
            }

            // Check if email already exists
            if (userRepository.findByEmail(req.email.toLowerCase().trim()).isPresent()) {
                System.out.println("❌ Email already exists: " + req.email);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email already exists"
                ));
            }

            // Convert role string to enum
            User.Role roleEnum;
            try {
                roleEnum = User.Role.valueOf(req.role.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid role. Must be STUDENT, TRAINER, or ADMIN"
                ));
            }

            // Hash the temporary password
            System.out.println("🔐 Hashing temporary password...");
            String hashedPassword = passwordUtil.hash(req.temporaryPassword);
            System.out.println("✅ Password hashed successfully");

            // Create and save user
            User user = new User();
            user.setName(req.name);
            user.setEmail(req.email.toLowerCase().trim());
            user.setPassword(hashedPassword);
            user.setRole(roleEnum);
            
            User savedUser = userRepository.save(user);
            System.out.println("✅ User created successfully with ID: " + savedUser.getId());
            System.out.println("════════════════════════════════════════════\n");

            return ResponseEntity.ok(Map.of(
                "message", "User created successfully",
                "id", savedUser.getId(),
                "name", savedUser.getName(),
                "email", savedUser.getEmail(),
                "role", savedUser.getRole().name(),
                "temporaryPassword", req.temporaryPassword,
                "note", "User can now login with their email and temporary password. They should change it on first login."
            ));

        } catch (Exception e) {
            System.out.println("❌ Error creating user: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create user",
                "details", e.getMessage()
            ));
        }
    }

    /**
     * Reset a user's password to a new temporary password
     * Useful when admins need to reset forgotten passwords
     * 
     * Request Body:
     * {
     *   "email": "rushi@gmail.com",
     *   "newTemporaryPassword": "newone123"
     * }
     */
    @PostMapping("/reset-temp-password")
    public ResponseEntity<?> resetUserPassword(@RequestBody ResetPasswordRequest req) {
        try {
            System.out.println("════════════════════════════════════════════");
            System.out.println("🔄 ADMIN: Reset user password");
            System.out.println("════════════════════════════════════════════");
            System.out.println("Email: " + req.email);
            System.out.println("New Temp Password Length: " + (req.newTemporaryPassword != null ? req.newTemporaryPassword.length() : 0));
            System.out.println("════════════════════════════════════════════\n");

            if (req.email == null || req.email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email is required"
                ));
            }

            if (req.newTemporaryPassword == null || req.newTemporaryPassword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "New password is required"
                ));
            }

            // Find user by email
            Optional<User> userOpt = userRepository.findByEmail(req.email.toLowerCase().trim());
            if (userOpt.isEmpty()) {
                System.out.println("❌ User not found: " + req.email);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "User not found"
                ));
            }

            User user = userOpt.get();
            
            // Hash the new password
            System.out.println("🔐 Hashing new password...");
            String hashedPassword = passwordUtil.hash(req.newTemporaryPassword);
            user.setPassword(hashedPassword);
            userRepository.save(user);
            
            System.out.println("✅ Password reset successfully for: " + user.getEmail());
            System.out.println("════════════════════════════════════════════\n");

            return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully",
                "email", user.getEmail(),
                "newPassword", req.newTemporaryPassword,
                "note", "User can now login with their email and new temporary password"
            ));

        } catch (Exception e) {
            System.out.println("❌ Error resetting password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to reset password",
                "details", e.getMessage()
            ));
        }
    }

    /**
     * Get the BCrypt hash of a password (for debugging/manual DB updates)
     * Use this when you need to manually update the database
     */
    @PostMapping("/get-password-hash")
    public ResponseEntity<?> getPasswordHash(@RequestBody Map<String, String> req) {
        String password = req.get("password");
        
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Password is required"
            ));
        }

        String hash = passwordUtil.hash(password);
        
        System.out.println("════════════════════════════════════════════");
        System.out.println("🔐 BCrypt Hash Generated");
        System.out.println("Clear Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("════════════════════════════════════════════");

        return ResponseEntity.ok(Map.of(
            "password", password,
            "hash", hash,
            "sqlUpdate", "UPDATE users SET password = '" + hash + "' WHERE email = '?';"
        ));
    }

    // DTOs
    static class CreateUserRequest {
        public String name;
        public String email;
        public String temporaryPassword;
        public String role;
    }

    static class ResetPasswordRequest {
        public String email;
        public String newTemporaryPassword;
    }
}
