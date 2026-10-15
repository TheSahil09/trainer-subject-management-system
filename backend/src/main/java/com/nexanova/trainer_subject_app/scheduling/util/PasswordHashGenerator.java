package com.nexanova.trainer_subject_app.scheduling.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate BCrypt hash for passwords
 * Run: java -cp target/classes:. PasswordHashGenerator "123456"
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: java PasswordHashGenerator <password>");
            System.exit(1);
        }
        
        String password = args[0];
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(password);
        
        System.out.println("====================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("====================================");
        System.out.println("\nUse this SQL to update the user:");
        System.out.println("UPDATE users SET password = '" + hash + "' WHERE email = 'rushi@gmail.com';");
        System.out.println("====================================");
    }
}
