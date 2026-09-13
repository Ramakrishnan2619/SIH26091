package com.sih26.vyapaarsathi.repository;

import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByUserOrderByCreatedAtDesc(User user);
    Optional<Assessment> findFirstByUserOrderByCreatedAtDesc(User user);
    Optional<Assessment> findByAssessmentIdAndUser(Long assessmentId, User user);
}
