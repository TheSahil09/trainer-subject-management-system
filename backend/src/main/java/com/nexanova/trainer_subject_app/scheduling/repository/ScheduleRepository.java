package com.nexanova.trainer_subject_app.scheduling.repository;

import com.nexanova.trainer_subject_app.scheduling.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByWeekStart(LocalDate weekStart);
    List<Schedule> findByWeekStartAndDayOfWeek(LocalDate weekStart, int dayOfWeek);
    List<Schedule> findByWeekStartAndStatus(LocalDate weekStart, String status);
    List<Schedule> findByStatus(String status);

    //List<Schedule> findByTrainerId(Long trainerId);
    List<Schedule> findByTrainerIdAndStatus(Long trainerId, String status);

    List<Schedule> findByTrainerIdAndStatusAndWeekStart(Long trainerId,String status, LocalDate weekStart);

}
