package com.flowdesk.repository;

import com.flowdesk.model.Ticket;
import com.flowdesk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByReporter(User reporter);
    List<Ticket> findByAssignee(User assignee);
    List<Ticket> findByStatus(String status);
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignee.id = :engineerId AND t.status IN ('open', 'assigned', 'in_progress')")
    long countActiveTicketsByEngineerId(Long engineerId);
}
