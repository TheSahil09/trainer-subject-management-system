package com.nexanova.trainer_subject_app.scheduling.controller;

import com.nexanova.trainer_subject_app.scheduling.entity.Module;
import com.nexanova.trainer_subject_app.scheduling.repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "http://localhost:3000")
public class ModuleController {

    @Autowired
    private ModuleRepository moduleRepository;

    // Get all modules
    @GetMapping
    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    // Get module by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getModuleById(@PathVariable Long id) {
        return moduleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get modules by course ID
    @GetMapping("/course/{courseId}")
    public List<Module> getModulesByCourse(@PathVariable Long courseId) {
        return moduleRepository.findByCourseId(courseId);
    }

    // Create new module
    @PostMapping
    public ResponseEntity<?> createModule(@RequestBody Module module) {
        // Check if module code already exists
        if (module.getModuleCode() != null && 
            moduleRepository.findByModuleCode(module.getModuleCode()).isPresent()) {
            return ResponseEntity.badRequest().body("Module code already exists");
        }

        Module saved = moduleRepository.save(module);
        return ResponseEntity.ok(saved);
    }

    // Update module
    @PutMapping("/{id}")
    public ResponseEntity<?> updateModule(@PathVariable Long id, @RequestBody Module module) {
        return moduleRepository.findById(id).map(existing -> {
            if (module.getName() != null) existing.setName(module.getName());
            if (module.getDescription() != null) existing.setDescription(module.getDescription());
            if (module.getModuleCode() != null) existing.setModuleCode(module.getModuleCode());
            if (module.getCourse() != null) existing.setCourse(module.getCourse());
            if (module.getDurationHours() != null) existing.setDurationHours(module.getDurationHours());
            if (module.getStatus() != null) existing.setStatus(module.getStatus());
            if (module.getSequenceNumber() != null) existing.setSequenceNumber(module.getSequenceNumber());

            Module updated = moduleRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete module
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteModule(@PathVariable Long id) {
        if (moduleRepository.existsById(id)) {
            moduleRepository.deleteById(id);
            return ResponseEntity.ok("Module deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
