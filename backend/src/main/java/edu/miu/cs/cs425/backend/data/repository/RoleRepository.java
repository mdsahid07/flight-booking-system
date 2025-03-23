package edu.miu.cs.cs425.backend.data.repository;

import edu.miu.cs.cs425.backend.domain.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    //find by name
    Role findByName(String name);
}
