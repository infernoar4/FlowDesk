package com.flowdesk.repository;

import com.flowdesk.model.LeaveRequest;
import com.flowdesk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, String> {
    List<LeaveRequest> findByEmployee(User employee);
    List<LeaveRequest> findByStatus(String status);
}
