package com.sih26.vyapaarsathi.repository;

import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.SchemeSearchSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SchemeSearchSessionRepository extends JpaRepository<SchemeSearchSession, Long> {
    Optional<SchemeSearchSession> findFirstByAssessmentOrderByCreatedAtDesc(Assessment assessment);
}
