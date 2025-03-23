package edu.miu.cs.cs425.backend.dto;

public record SignupRequest(String name, String email, String password, String phone, String address) {}
