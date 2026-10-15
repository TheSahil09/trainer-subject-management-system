package com.nexanova.trainer_subject_app.scheduling.repository;

import com.nexanova.trainer_subject_app.scheduling.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByToken(String token);
    Optional<PasswordReset> findByUserIdAndUsedFalse(Long userId);
    void deleteByToken(String token);
}
