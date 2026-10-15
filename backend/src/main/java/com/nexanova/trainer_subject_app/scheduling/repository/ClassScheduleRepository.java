package com.nexanova.trainer_subject_app.scheduling.repository;

import com.nexanova.trainer_subject_app.scheduling.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByCourseId(Long courseId);
    List<ClassSchedule> findByDay(String day);
    List<ClassSchedule> findByStatus(String status);
}
