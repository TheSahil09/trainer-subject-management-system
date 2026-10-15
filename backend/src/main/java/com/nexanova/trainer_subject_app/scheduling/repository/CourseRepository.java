package com.nexanova.trainer_subject_app.scheduling.repository;

import com.nexanova.trainer_subject_app.scheduling.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    
    // Eagerly load trainer to avoid LazyInitializationException
    @Query("SELECT c FROM Course c LEFT JOIN FETCH c.trainer")
    List<Course> findAllWithTrainer();
}
