package com.flowdesk.repository;

import com.flowdesk.model.AssetRequest;
import com.flowdesk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<AssetRequest, String> {
    List<AssetRequest> findByEmployee(User employee);
    List<AssetRequest> findByStatus(String status);
}
