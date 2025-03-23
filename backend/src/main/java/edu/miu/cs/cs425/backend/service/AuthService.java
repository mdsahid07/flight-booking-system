package edu.miu.cs.cs425.backend.service;

import edu.miu.cs.cs425.backend.domain.entity.Role;
import edu.miu.cs.cs425.backend.domain.entity.User;
import edu.miu.cs.cs425.backend.dto.AuthResponse;
import edu.miu.cs.cs425.backend.dto.LoginRequest;
import edu.miu.cs.cs425.backend.dto.SignupRequest;
import edu.miu.cs.cs425.backend.data.repository.RoleRepository;
import edu.miu.cs.cs425.backend.data.repository.UserRepository;
import edu.miu.cs.cs425.backend.config.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RoleRepository roleRepository;

    @Autowired
    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.roleRepository = roleRepository;
    }

    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(BCrypt.hashpw(request.password(), BCrypt.gensalt()));
        user.setPhone(request.phone());
        user.setAddress(request.address());
        user.setAvatar("/profiles/default-avatar.jpg");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Assign the USER role
        Role userRole = roleRepository.findByName("USER");
        if (userRole == null) {
            userRole = new Role("USER");
            roleRepository.save(userRole);
        }
        user.addRole(userRole);

        userRepository.save(user);

        // Generate token using the first role (or adjust JwtUtil to handle multiple roles)
        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("USER");
        String token = jwtUtil.generateToken(user.getEmail(), role);
        return new AuthResponse(token, role);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!BCrypt.checkpw(request.password(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate token using the first role (or adjust JwtUtil to handle multiple roles)
        String role = user.getRoles().stream().findFirst().map(Role::getName).orElse("USER");
        String token = jwtUtil.generateToken(user.getEmail(), role);
        return new AuthResponse(token, role);
    }
}