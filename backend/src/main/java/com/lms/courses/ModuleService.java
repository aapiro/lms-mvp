package com.lms.courses;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final com.lms.lessons.LessonRepository lessonRepository;

    @Transactional
    public Module createModule(Long courseId, ModuleDto.CreateModuleRequest req) {
        Module m = new Module();
        m.setCourseId(courseId);
        m.setTitle(req.getTitle());
        m.setDescription(req.getDescription());
        m.setModuleOrder(req.getModuleOrder());
        return moduleRepository.save(m);
    }

    @Transactional
    public Module updateModule(Long moduleId, ModuleDto.UpdateModuleRequest req) {
        Module m = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found: " + moduleId));
        if (req.getTitle() != null) m.setTitle(req.getTitle());
        if (req.getDescription() != null) m.setDescription(req.getDescription());
        if (req.getModuleOrder() != null) m.setModuleOrder(req.getModuleOrder());
        return moduleRepository.save(m);
    }

    @Transactional
    public void deleteModule(Long moduleId) {
        // Detach lessons from module before deletion
        lessonRepository.findByModuleIdOrderByLessonOrderAsc(moduleId)
                .forEach(l -> { l.setModuleId(null); lessonRepository.save(l); });
        moduleRepository.deleteById(moduleId);
    }

    public List<ModuleDto.ModuleResponse> getModulesByCourse(Long courseId) {
        return moduleRepository.findByCourseIdOrderByModuleOrderAsc(courseId)
                .stream().map(m -> {
                    ModuleDto.ModuleResponse r = new ModuleDto.ModuleResponse();
                    r.setId(m.getId());
                    r.setCourseId(m.getCourseId());
                    r.setTitle(m.getTitle());
                    r.setDescription(m.getDescription());
                    r.setModuleOrder(m.getModuleOrder());
                    r.setLessons(lessonRepository.findByModuleIdOrderByLessonOrderAsc(m.getId())
                            .stream().map(l -> {
                                CourseDto.LessonInfo li = new CourseDto.LessonInfo();
                                li.setId(l.getId());
                                li.setTitle(l.getTitle());
                                li.setLessonType(l.getLessonType().name());
                                li.setDurationSeconds(l.getDurationSeconds());
                                li.setModuleId(l.getModuleId());
                                li.setReleaseAfterDays(l.getReleaseAfterDays());
                                li.setAvailableFrom(l.getAvailableFrom());
                                li.setAvailable(true);
                                return li;
                            }).collect(Collectors.toList()));
                    return r;
                }).collect(Collectors.toList());
    }

    @Transactional
    public void assignLessonToModule(Long lessonId, Long moduleId) {
        var lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + lessonId));
        lesson.setModuleId(moduleId);
        lessonRepository.save(lesson);
    }
}

