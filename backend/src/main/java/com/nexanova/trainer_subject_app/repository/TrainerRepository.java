package com.nexanova.trainer_subject_app.repository;

import com.nexanova.trainer_subject_app.entity.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TrainerRepository extends JpaRepository<Trainer, Long> {

    Optional<Trainer> findByEmpId(String empId);

    Optional<Trainer> findByEmailIgnoreCase(String email);

    List<Trainer> findByCourse_Name(String courseName);

    List<Trainer> findByCourse_Id(Long courseId);

}