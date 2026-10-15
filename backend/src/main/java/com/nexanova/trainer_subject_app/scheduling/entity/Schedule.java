package com.nexanova.trainer_subject_app.scheduling.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "schedules")
public class Schedule {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "week_start")
    private LocalDate weekStart;

    @Column(name = "day_of_week")
    private int dayOfWeek;  // 1=Mon...7=Sun

    @Column(name = "slot_number")
    private int slot;       // 1=8AM,2=11AM,3=2PM,4=5PM

    @Column(name = "trainer_id")
    private Long trainerId;

    @Column(name = "module_id")
    private Long moduleId;

    @Column(name = "status", length = 20)
    private String status = "AVAILABLE";

    // 1. DEFAULT CONSTRUCTOR (REQUIRED BY JPA)
    public Schedule() {}

    // 2. ALL GETTERS
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getWeekStart() { return weekStart; }
    public void setWeekStart(LocalDate weekStart) { this.weekStart = weekStart; }

    public int getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(int dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public int getSlot() { return slot; }
    public void setSlot(int slot) { this.slot = slot; }

    public Long getTrainerId() { return trainerId; }
    public void setTrainerId(Long trainerId) { this.trainerId = trainerId; }

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
