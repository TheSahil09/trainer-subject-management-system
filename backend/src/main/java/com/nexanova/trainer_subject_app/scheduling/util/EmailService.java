package com.nexanova.trainer_subject_app.scheduling.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@trainersub.com}")
    private String fromEmail;

    @Value("${app.reset-password-url:http://localhost:3000/reset-password}")
    private String resetPasswordUrl;

    public void sendPasswordResetEmail(String recipientEmail, String resetToken, String userName) {
        try {
            // If mail sender is not configured, log the token for development
            if (mailSender == null) {
                System.out.println("⚠️ Email service not configured. Reset token for " + recipientEmail + ": " + resetToken);
                System.out.println("Reset URL: " + resetPasswordUrl + "?token=" + resetToken);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipientEmail);
            message.setSubject("Password Reset Request - Trainer Subject Management");

            String resetLink = resetPasswordUrl + "?token=" + resetToken;
            String emailBody = String.format(
                    "Hello %s,\n\n" +
                            "You have requested to reset your password. " +
                            "Click the link below to reset your password:\n\n" +
                            "%s\n\n" +
                            "This link will expire in 1 hour.\n\n" +
                            "If you did not request this, please ignore this email.\n\n" +
                            "Best regards,\n" +
                            "Trainer Subject Management Team",
                    userName, resetLink
            );

            message.setText(emailBody);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            throw new RuntimeException("Failed to send reset email", e);
        }
    }
}
