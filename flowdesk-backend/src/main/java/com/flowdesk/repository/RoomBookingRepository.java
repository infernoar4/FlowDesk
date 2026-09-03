package com.flowdesk.repository;

import com.flowdesk.model.RoomBooking;
import com.flowdesk.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomBookingRepository extends JpaRepository<RoomBooking, String> {
    List<RoomBooking> findByOrganizer(User organizer);
    List<RoomBooking> findByRoomId(String roomId);
}
