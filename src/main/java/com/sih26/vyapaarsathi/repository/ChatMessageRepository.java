package com.sih26.vyapaarsathi.repository;

import com.sih26.vyapaarsathi.entity.Assessment;
import com.sih26.vyapaarsathi.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByAssessmentOrderByCreatedAtAsc(Assessment assessment);
    List<ChatMessage> findTop10ByAssessmentOrderByCreatedAtDesc(Assessment assessment);
}
