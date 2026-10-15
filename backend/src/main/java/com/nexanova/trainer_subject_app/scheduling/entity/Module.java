package com.nexanova.trainer_subject_app.scheduling.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "modules")
public class Module {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "module_code", unique = true)
    private String moduleCode;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "duration_hours")
    private Integer durationHours;

    private String status;

    private Integer sequenceNumber;

    public Module(String name, String moduleCode, Course course) {
        this.name = name;
        this.moduleCode = moduleCode;
        this.course = course;
    }
}
