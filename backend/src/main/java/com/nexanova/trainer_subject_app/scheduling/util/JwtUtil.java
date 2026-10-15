package com.nexanova.trainer_subject_app.scheduling.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
  @Value("${app.jwt.secret:trainer-subject-app-default-jwt-secret-change-me-2026}")
  private String jwtSecret;

  private SecretKey secret;

    private final long EXPIRATION_TIME = 86400000L; // 24 hours

  @PostConstruct
  public void init() {
    byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);

    if (keyBytes.length < 32) {
      throw new IllegalStateException("JWT secret must be at least 32 bytes for HS256");
    }

    this.secret = Keys.hmacShaKeyFor(keyBytes);
  }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(secret)
                .compact();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isValid(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
        System.out.println("❌ JWT validation error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secret)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

   // private Claims getClaims(String token) {
     //   try {
       //     Claims claims = Jwts.parser()
         //           .verifyWith(secret)
           //         .build()
             //       .parseSignedClaims(token)
               //     .getPayload();
            //System.out.println("JWT CLAIMS: " + claims);  // ADD THIS
         //   return claims;
       // } catch (Exception e) {
         //  // System.out.println("JWT PARSE ERROR: " + e.getMessage());  // ADD THIS
           // throw e;
       // }
   // }



}
