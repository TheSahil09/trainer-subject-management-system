package com.nexanova.trainer_subject_app.scheduling.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.nexanova.trainer_subject_app.scheduling.config.RoleDeserializer;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // 'user' is a reserved keyword in many databases
@Data
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password; // Will be hashed

    @Enumerated(EnumType.STRING)
    @JsonDeserialize(using = RoleDeserializer.class)
    private Role role;

    public enum Role { ADMIN, STUDENT, TRAINER }
}
