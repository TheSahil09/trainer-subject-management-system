package com.nexanova.trainer_subject_app.scheduling.util;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class TokenGenerator {
    private static final SecureRandom random = new SecureRandom();
    private static final int TOKEN_LENGTH = 32;

    public String generateToken() {
        byte[] tokenBytes = new byte[TOKEN_LENGTH];
        random.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
