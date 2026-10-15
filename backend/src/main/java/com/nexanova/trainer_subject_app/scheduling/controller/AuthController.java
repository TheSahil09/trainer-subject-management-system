package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.User;
import com.nexanova.trainer_subject_app.scheduling.entity.PasswordReset;
import com.nexanova.trainer_subject_app.scheduling.repository.UserRepository;
import com.nexanova.trainer_subject_app.repository.TrainerRepository;
import com.nexanova.trainer_subject_app.entity.Trainer;
import com.nexanova.trainer_subject_app.scheduling.repository.PasswordResetRepository;
import com.nexanova.trainer_subject_app.scheduling.util.JwtUtil;
import com.nexanova.trainer_subject_app.scheduling.util.PasswordUtil;
import com.nexanova.trainer_subject_app.scheduling.util.EmailService;
import com.nexanova.trainer_subject_app.scheduling.util.TokenGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired UserRepository userRepo;
    @Autowired PasswordUtil passwordUtil;
    @Autowired JwtUtil jwtUtil;
    @Autowired PasswordResetRepository passwordResetRepo;
    @Autowired EmailService emailService;
    @Autowired TokenGenerator tokenGenerator;

    // when a trainer registers we also keep a row in trainers table
    @Autowired
    private TrainerRepository trainerRepo;

    /**
     * Simple DTO for register requests
     * Using String for role instead of enum to handle deserialization
     */
    static class RegisterRequest {
        public String name;
        public String email;
        public String password;
        public String role;  // ← Changed from User.Role to String
        
        public RegisterRequest() {}
        
        public RegisterRequest(String name, String email, String password, String role) {
            this.name = name;
            this.email = email;
            this.password = password;
            this.role = role;
        }
    }

    /**
     * Register a new user
     * 
     * Expected JSON from frontend:
     * {
     *   "name": "John Doe",
     *   "email": "john@example.com",
     *   "password": "Pass1234",
     *   "role": "STUDENT"  ← String value, will be converted to enum
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            // ===== LOG 1: Request received =====
            System.out.println("════════════════════════════════════════════");
            System.out.println(" REGISTER REQUEST RECEIVED");
            System.out.println("════════════════════════════════════════════");
            System.out.println("Name: " + req.name);
            System.out.println("Email: " + req.email);
            System.out.println("Password Length: " + (req.password != null ? req.password.length() : 0) + " characters");
            System.out.println("Role (string): " + req.role);
            System.out.println("════════════════════════════════════════════\n");

            // ===== VALIDATE: Check if all fields present =====
            if (req.name == null || req.name.trim().isEmpty()) {
                System.out.println("❌ Validation Error: Name is empty");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Name is required and cannot be empty"
                ));
            }

            if (req.email == null || req.email.trim().isEmpty()) {
                System.out.println("❌ Validation Error: Email is empty");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Email is required and cannot be empty"
                ));
            }

            if (req.password == null || req.password.trim().isEmpty()) {
                System.out.println("❌ Validation Error: Password is empty");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Password is required and cannot be empty"
                ));
            }

            if (req.role == null || req.role.trim().isEmpty()) {
                System.out.println("❌ Validation Error: Role is empty");
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Role is required (STUDENT, TRAINER, or ADMIN)"
                ));
            }

            // ===== CONVERT: String role to enum =====
            System.out.println(" Converting role string '" + req.role + "' to enum...");
            User.Role roleEnum;
            try {
                roleEnum = User.Role.valueOf(req.role.trim().toUpperCase());
                System.out.println(" Role converted successfully to: " + roleEnum);
            } catch (IllegalArgumentException e) {
                System.out.println(" Invalid role value: " + req.role);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Invalid role. Must be ADMIN, STUDENT, or TRAINER, but got: " + req.role,
                        "validRoles", new String[]{"ADMIN", "STUDENT", "TRAINER"}
                ));
            }

            // ===== CHECK: Email already exists? =====
            if (userRepo.findByEmail(req.email).isPresent()) {
                System.out.println(" Email already exists: " + req.email);
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Email already exists. Please use a different email or login."
                ));
            }
            System.out.println(" Email is unique: " + req.email);

            // ===== HASH PASSWORD =====
            System.out.println(" Hashing password...");
            String hashedPassword = passwordUtil.hash(req.password);
            System.out.println(" Password hashed successfully");

            // ===== CREATE USER OBJECT =====
            System.out.println("👤 Creating user object...");
            User user = new User();
            user.setName(req.name);
            user.setEmail(req.email);
            user.setPassword(hashedPassword);
            user.setRole(roleEnum);
            System.out.println("✅ User object created");

            // ===== SAVE TO DATABASE =====
            System.out.println("💾 Saving user to database...");
            userRepo.save(user);
            System.out.println("✅ User saved successfully with ID: " + user.getId());

            // if new trainer account, mirror entry in trainers table
            if (roleEnum == User.Role.TRAINER) {
                System.out.println("🛠 Creating corresponding Trainer record for user...");
                // avoid duplicate
                boolean exists = trainerRepo.findAll().stream()
                        .anyMatch(t -> t.getEmail().equalsIgnoreCase(user.getEmail()));
                if (!exists) {
                    Trainer t = new Trainer();
                    t.setName(user.getName());
                    t.setEmail(user.getEmail());
                    // use user id as empId prefix
                    t.setEmpId("U" + user.getId());
                    trainerRepo.save(t);
                    System.out.println("✅ Trainer record created: " + t.getEmpId());
                } else {
                    System.out.println("⚠️ Trainer record already exists for email " + user.getEmail());
                }
            }

            // ===== SUCCESS RESPONSE =====
            System.out.println("✅ Registration successful for: " + req.email);
            System.out.println("════════════════════════════════════════════\n");
            
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully! Please login.",
                    "email", req.email,
                    "role", roleEnum.name(),
                    "status", "success"
            ));

        } catch (Exception e) {
            // ===== ERROR HANDLING: Catch any unexpected errors =====
            System.out.println("❌ ❌ ❌ ERROR DURING REGISTRATION ❌ ❌ ❌");
            System.out.println("Error Type: " + e.getClass().getSimpleName());
            System.out.println("Error Message: " + e.getMessage());
            System.out.println("Stack Trace:");
            e.printStackTrace();
            System.out.println("════════════════════════════════════════════\n");

            return ResponseEntity.status(500).body(Map.of(
                    "error", "Registration failed due to an internal server error",
                    "details", e.getMessage(),
                    "type", e.getClass().getSimpleName()
            ));
        }
    }

    record LoginRequest(String email, String password) {}
    record LoginResponse(String token) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            System.out.println("════════════════════════════════════════════");
            System.out.println("📥 LOGIN REQUEST RECEIVED");
            System.out.println("════════════════════════════════════════════");
            System.out.println("Email: " + req.email);
            System.out.println("Password Length: " + (req.password != null ? req.password.length() : 0) + " characters");
            System.out.println("════════════════════════════════════════════\n");

            var userOpt = userRepo.findByEmail(req.email);
            if (userOpt.isEmpty()) {
                System.out.println("❌ User not found: " + req.email);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }

            User user = userOpt.get();
            System.out.println("✅ User found: " + user.getEmail() + " (Role: " + user.getRole() + ")");

            if (!passwordUtil.verify(req.password, user.getPassword())) {
                System.out.println("❌ Password verification failed for: " + req.email);
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
            }

            System.out.println("✅ Password verified successfully");
            String token = jwtUtil.generateToken(req.email, user.getRole().name());
            System.out.println("✅ JWT token generated");
            System.out.println("════════════════════════════════════════════\n");

            // return ResponseEntity.ok(Map.of(
                    // "token", token,
                    // "role", user.getRole().name(),
                    // "email", req.email
            // ));

         return ResponseEntity.ok(Map.of(
        "token", token,
        "id", user.getId(),                 //  ADDED THIS
        "name", user.getName(),             //  ADDED THIS
        "email", user.getEmail(),           //  Use user.getEmail()
        "role", user.getRole().name()
        ));


        } catch (Exception e) {
            System.out.println("❌ ERROR DURING LOGIN");
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            System.out.println("════════════════════════════════════════════\n");

            return ResponseEntity.status(500).body(Map.of(
                    "error", "Login failed: " + e.getMessage()
            ));
        }
    }

    record ForgotPasswordRequest(String email) {}

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        var userOpt = userRepo.findByEmail(req.email);
        if (userOpt.isEmpty()) {
            // Don't reveal whether email exists (security best practice)
            return ResponseEntity.ok(Map.of("message", "If email exists, reset link will be sent"));
        }

        User user = userOpt.get();

        // Invalidate any existing reset tokens for this user
        var existingReset = passwordResetRepo.findByUserIdAndUsedFalse(user.getId());
        existingReset.ifPresent(passwordResetRepo::delete);

        // Generate reset token
        String resetToken = tokenGenerator.generateToken();
        LocalDateTime expiryTime = LocalDateTime.now().plusHours(1); // 1 hour expiry

        PasswordReset passwordReset = new PasswordReset(user, resetToken, expiryTime);
        passwordResetRepo.save(passwordReset);

        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getName());

        return ResponseEntity.ok(Map.of("message", "If email exists, reset link will be sent"));
    }

    record ResetPasswordRequest(String token, String newPassword) {}

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.token == null || req.token.isBlank() || req.newPassword == null || req.newPassword.isBlank()) {
            return ResponseEntity.badRequest().body("Token and new password required");
        }

        // Validate password strength
        if (req.newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }

        var resetOpt = passwordResetRepo.findByToken(req.token);
        if (resetOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid reset token");
        }

        PasswordReset reset = resetOpt.get();
        if (!reset.isValid()) {
            return ResponseEntity.badRequest().body("Reset token has expired or already been used");
        }

        // Update password
        User user = reset.getUser();
        user.setPassword(passwordUtil.hash(req.newPassword));
        userRepo.save(user);

        // Mark reset as used
        reset.setUsed(true);
        reset.setUsedAt(LocalDateTime.now());
        passwordResetRepo.save(reset);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/validate-reset-token/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        var resetOpt = passwordResetRepo.findByToken(token);
        if (resetOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("valid", false));
        }

        PasswordReset reset = resetOpt.get();
        boolean isValid = reset.isValid();
        return ResponseEntity.ok(Map.of("valid", isValid));
    }

    // ===== ADMIN UTILITY: Hash a password for direct DB updates =====
    // Usage: POST /api/auth/hash-password with {"password": "123456"}
    // IMPORTANT: Remove this endpoint in production!
    record HashRequest(String password) {}
    
    @PostMapping("/hash-password")
    public ResponseEntity<?> hashPassword(@RequestBody HashRequest req) {
        if (req.password == null || req.password.isBlank()) {
            return ResponseEntity.badRequest().body("Password required");
        }
        
        String hash = passwordUtil.hash(req.password);
        System.out.println("════════════════════════════════════════════");
        System.out.println("Password Hash Generated");
        System.out.println("Clear Password: " + req.password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("SQL Command:");
        System.out.println("UPDATE users SET password = '" + hash + "' WHERE email = 'rushi@gmail.com';");
        System.out.println("════════════════════════════════════════════");
        
        return ResponseEntity.ok(Map.of(
            "password", req.password,
            "hash", hash,
            "sqlUpdate", "UPDATE users SET password = '" + hash + "' WHERE email = 'rushi@gmail.com';"
        ));
    }
}


