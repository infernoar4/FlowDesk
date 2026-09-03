package com.flowdesk.controller;

import com.flowdesk.model.RoomBooking;
import com.flowdesk.repository.RoomBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomBookingRepository roomBookingRepository;

    @Autowired
    public RoomController(RoomBookingRepository roomBookingRepository) {
        this.roomBookingRepository = roomBookingRepository;
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<RoomBooking>> getAllBookings() {
        return ResponseEntity.ok(roomBookingRepository.findAll());
    }

    @PostMapping("/bookings")
    public ResponseEntity<RoomBooking> createBooking(@RequestBody RoomBooking booking) {
        return ResponseEntity.ok(roomBookingRepository.save(booking));
    }
}
