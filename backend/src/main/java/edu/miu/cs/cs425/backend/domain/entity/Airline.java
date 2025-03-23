package edu.miu.cs.cs425.backend.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Airline {
    @Id
    private String code;
    private String name;
    private String logoUrl;

    // No-args constructor
    public Airline() {
    }

    // Getters and setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    @Override
    public String toString() {
        return "Airline{" +
                "code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", logoUrl='" + logoUrl + '\'' +
                '}';
    }
}