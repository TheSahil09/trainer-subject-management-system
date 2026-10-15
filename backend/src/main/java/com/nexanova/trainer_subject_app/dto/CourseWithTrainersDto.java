package com.nexanova.trainer_subject_app.dto;

import com.nexanova.trainer_subject_app.scheduling.entity.Course;
import com.nexanova.trainer_subject_app.entity.Trainer;

import java.util.List;

public class CourseWithTrainersDto {

    private Course course;
    private List<Trainer> trainers;

    public CourseWithTrainersDto(Course course, List<Trainer> trainers) {
        this.course = course;
        this.trainers = trainers;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public List<Trainer> getTrainers() {
        return trainers;
    }

    public void setTrainers(List<Trainer> trainers) {
        this.trainers = trainers;
    }
}
