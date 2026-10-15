package com.nexanova.trainer_subject_app.scheduling.repository;

import com.nexanova.trainer_subject_app.scheduling.entity.Enrollment;
import com.nexanova.trainer_subject_app.scheduling.entity.User; //after added
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;//after added


public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    //after added

    // Gets all enrollments for specific student (their dashboard)
    List<Enrollment> findByStudent(User student);

    // Optional: course enrollments count
    Long countByCourseId(Long courseId);
}



