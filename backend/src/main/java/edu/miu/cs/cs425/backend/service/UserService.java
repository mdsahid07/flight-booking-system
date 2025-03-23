package edu.miu.cs.cs425.backend.service;

import edu.miu.cs.cs425.backend.data.repository.RoleRepository;
import edu.miu.cs.cs425.backend.data.repository.UserRepository;
import edu.miu.cs.cs425.backend.domain.entity.Role;
import edu.miu.cs.cs425.backend.domain.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public UserService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // Create
    public User createUser(User user, Set<String> roleNames) {
        // Validate ID
        if (user.getId() == null || user.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        // Validate Email
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }

        // Check for existing user by email (unique constraint)
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User with email " + user.getEmail() + " already exists");
        }

        // Check for existing user by ID
        if (userRepository.findById(user.getId()).isPresent()) {
            throw new IllegalArgumentException("User with ID " + user.getId() + " already exists");
        }

        // Validate and assign roles
        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("User must have at least one role");
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role role = roleRepository.findByName(roleName);
            if (role == null) {
                role = new Role(roleName);
                roleRepository.save(role);
            }
            roles.add(role);
        }

        // Assign roles to the user
        for (Role role : roles) {
            user.addRole(role);
        }

        // Set timestamps
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Save the user
        return userRepository.save(user);
    }

    // Read - Find One
    public Optional<User> findUserById(String id) {
        return userRepository.findById(id);
    }

    // Read - Find All
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    // Update
    public User updateUser(String id, User userDetails) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            user.setPassword(userDetails.getPassword());
            user.setPhone(userDetails.getPhone());
            user.setAddress(userDetails.getAddress());
            user.setAvatar(userDetails.getAvatar());
            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        } else {
            throw new IllegalArgumentException("User with ID " + id + " not found");
        }
    }

    // Delete
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User with ID " + id + " not found");
        }
        userRepository.deleteById(id);
    }

    // Custom search by email (return single user since email is unique)
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email); // Assumes a method for exact match
    }

    // Custom search by name
    public List<User> findUsersByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name);
    }
}