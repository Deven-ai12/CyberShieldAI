package com.cybershield.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
        name = "login_history",
        indexes = {
                @Index(name = "idx_login_history_user_login", columnList = "user_id,loginAt"),
                @Index(name = "idx_login_history_email", columnList = "email")
        }
)
public class LoginHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(length = 80)
    private String ipAddress;

    @Column(length = 500)
    private String userAgent;

    @Column(length = 120)
    private String deviceFingerprint;

    @Column(nullable = false)
    private boolean successful;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private Instant loginAt;
}
