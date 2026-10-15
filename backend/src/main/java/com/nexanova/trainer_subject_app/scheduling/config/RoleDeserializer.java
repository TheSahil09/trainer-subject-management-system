package com.nexanova.trainer_subject_app.scheduling.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.nexanova.trainer_subject_app.scheduling.entity.User.Role;

import java.io.IOException;

/**
 * Custom deserializer to convert string "STUDENT" to Role.STUDENT enum
 * 
 * WHY THIS IS NEEDED:
 * - Frontend sends: {"role": "STUDENT"} (as a string)
 * - Backend expects: Role.STUDENT (as an enum)
 * - Without this, Spring throws error and crashes
 * - With this, Spring converts "STUDENT" → Role.STUDENT automatically
 */
public class RoleDeserializer extends JsonDeserializer<Role> {

    @Override
    public Role deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) 
            throws IOException {
        
        // Get the string value that frontend sent
        String roleValue = jsonParser.getValueAsString();
        
        // Log for debugging
        System.out.println("🔍 Deserializing role: " + roleValue);
        
        if (roleValue == null || roleValue.trim().isEmpty()) {
            System.out.println("❌ Role is empty or null!");
            throw new IOException("Role cannot be empty");
        }
        
        // Convert string to uppercase (handles "student", "Student", "STUDENT")
        String upperRole = roleValue.trim().toUpperCase();
        
        // Try to find matching enum
        try {
            Role role = Role.valueOf(upperRole);
            System.out.println("✅ Role converted successfully: " + role);
            return role;
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Invalid role value: " + upperRole);
            throw new IOException("Invalid role. Must be ADMIN, STUDENT, or TRAINER, but got: " + roleValue, e);
        }
    }
}
