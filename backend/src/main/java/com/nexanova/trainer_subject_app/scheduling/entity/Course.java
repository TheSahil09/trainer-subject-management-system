package com.nexanova.trainer_subject_app.scheduling.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data 
@NoArgsConstructor
@Table(name = "courses")
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String code;
    
     @Column(columnDefinition = "TEXT")
    private String description;   // ADD THIS

    private Integer credits;

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;  // ADMIN assigns trainer to course
}
