package edu.miu.cs.cs425.backend.dto;

import java.util.Set;

public record UserCreationRequest(
        String id,
        String name,
        String email,
        String password,
        String phone,
        String address,
        String avatar,
        Set<String> roles
) {}