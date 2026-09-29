package com.cybershield.backend.service;

import com.cybershield.backend.config.MailProperties;
import com.cybershield.backend.entity.Alert;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final MailProperties mailProperties;

    public boolean send(Alert alert) {
        return send(alert.getRecipientEmail(), "[CyberShieldAI] " + alert.getTitle(), alert.getMessage(), "alert " + alert.getId());
    }

    public boolean send(String recipientEmail, String subject, String body) {
        return send(recipientEmail, subject, body, "message");
    }

    private boolean send(String recipientEmail, String subject, String body, String context) {
        if (!mailProperties.enabled()) {
            log.info("Mail disabled; {} would be sent to {}", context, recipientEmail);
            return true;
        }
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Mail recipient missing for {}", context);
            return false;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Mail is enabled but JavaMailSender is not configured");
            return false;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailProperties.from());
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            return true;
        } catch (RuntimeException exception) {
            log.warn("Failed to send email {}: {}", context, exception.getMessage());
            return false;
        }
    }
}
