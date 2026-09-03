package com.flowdesk.service;

import com.flowdesk.model.User;
import com.flowdesk.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> authenticate(String usernameOrEmail, String password) {
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByCompanyEmail(usernameOrEmail);
        }

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt;
        }

        return Optional.empty();
    }

    public User registerUser(User user) {
        if (user.getEmployeeId() == null || user.getEmployeeId().isEmpty()) {
            user.setEmployeeId("EMP-" + (10000 + (int)(Math.random() * 90000)));
        }
        if (user.getInitials() == null || user.getInitials().isEmpty()) {
            String[] parts = user.getFullName().trim().split(" ");
            String initials = parts.length >= 2 
                ? ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
                : user.getFullName().substring(0, Math.min(2, user.getFullName().length())).toUpperCase();
            user.setInitials(initials);
        }
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            user.setUsername(user.getCompanyEmail().split("@")[0]);
        }
        return userRepository.save(user);
    }
}
