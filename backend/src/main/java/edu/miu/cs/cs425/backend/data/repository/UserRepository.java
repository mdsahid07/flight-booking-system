package edu.miu.cs.cs425.backend.data.repository;

import edu.miu.cs.cs425.backend.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    // Custom query method for finding by email or name
    List<User> findByEmailContainingIgnoreCase(String email);
    List<User> findByNameContainingIgnoreCase(String name);
    //find user by email with isPresent()
    Optional<User> findByEmail(String email);


}