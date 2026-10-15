package com.nexanova.trainer_subject_app.scheduling.repository;

import com.nexanova.trainer_subject_app.scheduling.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByCourseId(Long courseId);
    Optional<Module> findByModuleCode(String moduleCode);
}
