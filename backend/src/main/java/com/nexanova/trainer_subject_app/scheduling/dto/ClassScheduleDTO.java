package com.nexanova.trainer_subject_app.scheduling.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * ClassScheduleDTO - For managing class room schedules
 * Maps frontend data for SchedulesPage
 */
public class ClassScheduleDTO {
    private Long id;

    @JsonProperty("courseId")
    private Long courseId;

    @JsonProperty("day")
    private String day;  // e.g., "Monday"

    @JsonProperty("startTime")
    private String startTime;  // e.g., "09:00"

    @JsonProperty("endTime")
    private String endTime;  // e.g., "11:00"

    @JsonProperty("room")
    private String room;  // e.g., "A101"

    // Constructors
    public ClassScheduleDTO() {}

    public ClassScheduleDTO(Long courseId, String day, String startTime, String endTime, String room) {
        this.courseId = courseId;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getDay() { return day; }
    public void setDay(String day) { this.day = day; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }

    @Override
    public String toString() {
        return "ClassScheduleDTO{" +
                "id=" + id +
                ", courseId=" + courseId +
                ", day='" + day + '\'' +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", room='" + room + '\'' +
                '}';
    }
}
