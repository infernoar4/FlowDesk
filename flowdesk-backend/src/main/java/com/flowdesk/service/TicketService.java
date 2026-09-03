package com.flowdesk.service;

import com.flowdesk.model.Ticket;
import com.flowdesk.model.User;
import com.flowdesk.repository.TicketRepository;
import com.flowdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Autowired
    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Optional<Ticket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    /**
     * Java Automated Workload Load-Balancer Engine
     * Uses Java Collection Framework and Java Streams API to automatically select
     * the Support Engineer with the minimum current active ticket load.
     */
    public Ticket createAndAutoAssignTicket(Ticket ticket, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("Reporter user not found with ID: " + reporterId));
        
        ticket.setReporter(reporter);
        
        // 1. Fetch all support engineers using Collection Framework
        List<User> supportEngineers = userRepository.findByRole("support");

        if (!supportEngineers.isEmpty()) {
            // 2. Build a workload map using HashMap<User, Long>
            Map<User, Long> engineerWorkloadMap = new HashMap<>();

            for (User engineer : supportEngineers) {
                long activeLoad = ticketRepository.countActiveTicketsByEngineerId(engineer.getId());
                engineerWorkloadMap.put(engineer, activeLoad);
            }

            // 3. Use Java 8+ Streams API to find the engineer with minimum active workload
            Optional<Map.Entry<User, Long>> selectedEngineerEntry = engineerWorkloadMap.entrySet()
                    .stream()
                    .min(Comparator.comparingLong(Map.Entry::getValue));

            if (selectedEngineerEntry.isPresent()) {
                User assignedEngineer = selectedEngineerEntry.get().getKey();
                ticket.setAssignee(assignedEngineer);
                ticket.setStatus("assigned");
                System.out.println("🤖 [Java Load Balancer] Auto-assigned ticket " + ticket.getId() 
                        + " to Engineer: " + assignedEngineer.getFullName() 
                        + " (Current active load: " + selectedEngineerEntry.get().getValue() + ")");
            }
        }

        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketStatus(String ticketId, String newStatus, Long requestingEngineerId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        // Strict Single-Engineer Ownership Check in Java
        if (ticket.getAssignee() != null && !ticket.getAssignee().getId().equals(requestingEngineerId)) {
            throw new IllegalStateException("Unauthorized: Only the assigned engineer (" 
                    + ticket.getAssignee().getFullName() + ") can update this ticket.");
        }

        ticket.setStatus(newStatus);
        return ticketRepository.save(ticket);
    }
}
