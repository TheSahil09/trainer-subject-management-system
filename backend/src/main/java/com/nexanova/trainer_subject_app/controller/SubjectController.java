// package com.nexanova.trainer_subject_app.controller;

// import com.nexanova.trainer_subject_app.dto.SubjectWithTrainersDto;
// import com.nexanova.trainer_subject_app.entity.Subject;
// import com.nexanova.trainer_subject_app.entity.Trainer;
// import com.nexanova.trainer_subject_app.repository.SubjectRepository;
// import com.nexanova.trainer_subject_app.repository.TrainerRepository;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;


// @RestController
// @RequestMapping("/api/subjects")
// @CrossOrigin(origins = "http://localhost:3000")
// public class SubjectController {

//     private final SubjectRepository subjectrepository;
//     private final TrainerRepository trainerRepository;

//     public SubjectController(SubjectRepository subjectRepository,
//                              TrainerRepository trainerRepository) {
//         this.subjectrepository = subjectRepository;
//         this.trainerRepository = trainerRepository;
//     }


//     @PostMapping
//     public Subject addSubject(@RequestBody Subject subject) {
//         return subjectrepository.save(subject);
//     }

//     @GetMapping
//     public List<Subject> getAllSubjects() {
//         return subjectrepository.findAll();
//     }

//     @GetMapping("/{id}")
//     public ResponseEntity<SubjectWithTrainersDto> getSubjectWithTrainers(@PathVariable Long id) {
//         return subjectrepository.findById(id)
//                 .map(subject -> {
//                     List<Trainer> trainers = trainerRepository.findBySubject_Id(id);
//                     SubjectWithTrainersDto dto = new SubjectWithTrainersDto(subject, trainers);
//                     return ResponseEntity.ok(dto);
//                 })
//                 .orElse(ResponseEntity.notFound().build());
//     }
// }


