package com.lms.courses;

import com.lms.lessons.Lesson;
import com.lms.lessons.LessonRepository;
import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.progress.ProgressRepository;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProgressRepository progressRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final CoursePrerequisiteRepository prerequisiteRepository;
    private final ModuleRepository moduleRepository;

    @Transactional
    public Course createCourse(CourseDto.CreateCourseRequest request, User user) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setCreatedBy(user.getId());
        if (request.getStatus() != null) course.setStatus(request.getStatus());
        if (request.getEnrollmentType() != null) course.setEnrollmentType(request.getEnrollmentType());
        course.setCapacityLimit(request.getCapacityLimit());
        course.setCertificateTemplate(request.getCertificateTemplate());
        applyCategories(course, request.getCategoryIds());
        applyTags(course, request.getTagIds());
        Course saved = courseRepository.save(course);
        applyPrerequisites(saved.getId(), request.getPrerequisiteCourseIds());
        return saved;
    }

    @Transactional
    public Course updateCourse(Long courseId, CourseDto.UpdateCourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getPrice() != null) course.setPrice(request.getPrice());
        if (request.getStatus() != null) course.setStatus(request.getStatus());
        if (request.getEnrollmentType() != null) course.setEnrollmentType(request.getEnrollmentType());
        if (request.getCapacityLimit() != null) course.setCapacityLimit(request.getCapacityLimit());
        if (request.getCertificateTemplate() != null) course.setCertificateTemplate(request.getCertificateTemplate());
        if (request.getCategoryIds() != null) applyCategories(course, request.getCategoryIds());
        if (request.getTagIds() != null) applyTags(course, request.getTagIds());
        Course saved = courseRepository.save(course);
        if (request.getPrerequisiteCourseIds() != null) applyPrerequisites(courseId, request.getPrerequisiteCourseIds());
        return saved;
    }

    @Transactional
    public Course changeStatus(Long courseId, Course.CourseStatus newStatus) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        course.setStatus(newStatus);
        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }

    public List<CourseDto.CourseResponse> getAllCourses(User user, String categorySlug, String tagSlug, String enrollmentType) {
        List<Course> courses;
        boolean isAdmin = user != null && user.getRole() == com.lms.users.User.Role.ADMIN;

        if (categorySlug != null && !categorySlug.isBlank()) {
            courses = courseRepository.findByCategorySlug(categorySlug);
        } else if (tagSlug != null && !tagSlug.isBlank()) {
            courses = courseRepository.findByTagSlug(tagSlug);
        } else if (isAdmin) {
            courses = courseRepository.findAllByOrderByCreatedAtDesc();
        } else {
            courses = courseRepository.findByStatusOrderByCreatedAtDesc(Course.CourseStatus.PUBLISHED);
        }

        // Filter by status for non-admins
        if (!isAdmin) {
            courses = courses.stream()
                    .filter(c -> c.getStatus() == Course.CourseStatus.PUBLISHED)
                    .collect(Collectors.toList());
        }

        // Filter by enrollmentType if provided
        if (enrollmentType != null && !enrollmentType.isBlank()) {
            try {
                Course.EnrollmentType et = Course.EnrollmentType.valueOf(enrollmentType.toUpperCase());
                courses = courses.stream().filter(c -> c.getEnrollmentType() == et).collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        return courses.stream().map(course -> buildCourseResponse(course, user)).collect(Collectors.toList());
    }

    public CourseDto.CourseDetailResponse getCourseById(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isAdmin = user != null && user.getRole() == com.lms.users.User.Role.ADMIN;
        if (!isAdmin && course.getStatus() != Course.CourseStatus.PUBLISHED) {
            throw new RuntimeException("Course not found");
        }

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
        List<Module> modules = moduleRepository.findByCourseIdOrderByModuleOrderAsc(courseId);

        CourseDto.CourseDetailResponse response = new CourseDto.CourseDetailResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setPrice(course.getPrice());
        response.setThumbnailUrl(course.getThumbnailUrl());
        response.setCreatedBy(course.getCreatedBy());
        response.setCreatedAt(course.getCreatedAt());
        response.setStatus(course.getStatus() != null ? course.getStatus().name() : null);
        response.setEnrollmentType(course.getEnrollmentType() != null ? course.getEnrollmentType().name() : null);
        response.setCapacityLimit(course.getCapacityLimit());
        response.setCertificateTemplate(course.getCertificateTemplate());
        response.setEnrolledCount((int) courseRepository.countEnrolled(courseId));
        response.setCategories(course.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
        response.setTags(course.getTags().stream().map(Tag::getName).collect(Collectors.toList()));

        // Prerequisites
        List<CoursePrerequisite> prereqs = prerequisiteRepository.findByCourseId(courseId);
        boolean prereqsMet = true;
        List<CourseDto.PrerequisiteInfo> prereqInfos = new ArrayList<>();
        for (CoursePrerequisite prereq : prereqs) {
            CourseDto.PrerequisiteInfo pi = new CourseDto.PrerequisiteInfo();
            pi.setCourseId(prereq.getPrerequisiteCourseId());
            courseRepository.findById(prereq.getPrerequisiteCourseId()).ifPresent(pc -> pi.setCourseTitle(pc.getTitle()));
            boolean done = user != null && checkPrerequisiteMet(prereq.getPrerequisiteCourseId(), user.getId());
            pi.setCompleted(done);
            if (!done) prereqsMet = false;
            prereqInfos.add(pi);
        }
        response.setPrerequisitesMet(prereqsMet);
        response.setPrerequisites(prereqInfos);

        // Purchase date for drip calculation
        LocalDateTime purchaseDate = null;
        if (user != null) {
            purchaseDate = purchaseRepository.findByUserIdAndCourseId(user.getId(), courseId)
                    .map(p -> p.getPurchasedAt()).orElse(null);
        }
        final LocalDateTime pd = purchaseDate;

        boolean isFree = course.getPrice() != null && course.getPrice().compareTo(BigDecimal.ZERO) == 0;
        boolean hasPurchase = user != null && purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                user.getId(), courseId, Purchase.PurchaseStatus.COMPLETED);
        // purchased is only true for authenticated users
        response.setPurchased(user != null && (isFree || hasPurchase));

        if (response.isPurchased()) {
            response.setProgressPercentage(calculateProgress(user.getId(), courseId, lessons));
        }

        // Build lesson infos with drip calculation
        var progressMap = (user != null)
                ? progressRepository.findByUserIdAndCourseId(user.getId(), courseId).stream()
                        .collect(Collectors.toMap(p -> p.getLessonId(), p -> p.getCompleted()))
                : Collections.<Long, Boolean>emptyMap();

        List<CourseDto.LessonInfo> lessonInfos = lessons.stream().map(l -> toLessonInfo(l, progressMap, pd)).collect(Collectors.toList());
        response.setLessons(lessonInfos);

        // Build modules with nested lessons
        if (!modules.isEmpty()) {
            Map<Long, List<CourseDto.LessonInfo>> byModule = lessonInfos.stream()
                    .filter(li -> li.getModuleId() != null)
                    .collect(Collectors.groupingBy(CourseDto.LessonInfo::getModuleId));
            response.setModules(modules.stream().map(m -> {
                CourseDto.ModuleInfo mi = new CourseDto.ModuleInfo();
                mi.setId(m.getId());
                mi.setTitle(m.getTitle());
                mi.setDescription(m.getDescription());
                mi.setModuleOrder(m.getModuleOrder());
                mi.setLessons(byModule.getOrDefault(m.getId(), Collections.emptyList()));
                return mi;
            }).collect(Collectors.toList()));
        }

        return response;
    }

    // ── Prerequisites ────────────────────────────────────────────────

    @Transactional
    public void addPrerequisite(Long courseId, Long prereqCourseId) {
        if (courseId.equals(prereqCourseId))
            throw new RuntimeException("A course cannot be its own prerequisite");
        if (prerequisiteRepository.existsByCourseIdAndPrerequisiteCourseId(courseId, prereqCourseId))
            throw new RuntimeException("Prerequisite already exists");
        courseRepository.findById(prereqCourseId)
                .orElseThrow(() -> new RuntimeException("Prerequisite course not found: " + prereqCourseId));
        CoursePrerequisite cp = new CoursePrerequisite();
        cp.setCourseId(courseId);
        cp.setPrerequisiteCourseId(prereqCourseId);
        prerequisiteRepository.save(cp);
    }

    @Transactional
    public void removePrerequisite(Long courseId, Long prereqCourseId) {
        prerequisiteRepository.deleteByCourseIdAndPrerequisiteCourseId(courseId, prereqCourseId);
    }

    public List<CourseDto.PrerequisiteInfo> getPrerequisites(Long courseId) {
        return prerequisiteRepository.findByCourseId(courseId).stream().map(p -> {
            CourseDto.PrerequisiteInfo pi = new CourseDto.PrerequisiteInfo();
            pi.setCourseId(p.getPrerequisiteCourseId());
            courseRepository.findById(p.getPrerequisiteCourseId()).ifPresent(c -> pi.setCourseTitle(c.getTitle()));
            return pi;
        }).collect(Collectors.toList());
    }

    // ── Capacity ─────────────────────────────────────────────────────

    public void checkAndEnforceCapacity(Long courseId) {
        Course course = courseRepository.findById(courseId).orElseThrow();
        if (course.getCapacityLimit() != null) {
            long enrolled = courseRepository.countEnrolled(courseId);
            if (enrolled >= course.getCapacityLimit()) {
                throw new RuntimeException("Course is at full capacity (" + course.getCapacityLimit() + ")");
            }
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private boolean checkPrerequisiteMet(Long prereqCourseId, Long userId) {
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(prereqCourseId);
        if (lessons.isEmpty()) return true;
        long done = progressRepository.findByUserIdAndCourseId(userId, prereqCourseId)
                .stream().filter(p -> Boolean.TRUE.equals(p.getCompleted())).count();
        return done >= lessons.size();
    }

    public boolean isLessonAvailable(Lesson lesson, LocalDateTime purchaseDate) {
        if (lesson.getAvailableFrom() != null) return lesson.getAvailableFrom().isBefore(LocalDateTime.now());
        if (lesson.getReleaseAfterDays() != null && purchaseDate != null)
            return purchaseDate.plusDays(lesson.getReleaseAfterDays()).isBefore(LocalDateTime.now());
        return true;
    }

    private CourseDto.LessonInfo toLessonInfo(Lesson l, Map<Long, Boolean> progressMap, LocalDateTime purchaseDate) {
        CourseDto.LessonInfo info = new CourseDto.LessonInfo();
        info.setId(l.getId());
        info.setTitle(l.getTitle());
        info.setLessonType(l.getLessonType().name());
        info.setDurationSeconds(l.getDurationSeconds());
        info.setModuleId(l.getModuleId());
        info.setReleaseAfterDays(l.getReleaseAfterDays());
        info.setAvailableFrom(l.getAvailableFrom());
        info.setCompleted(progressMap.getOrDefault(l.getId(), false));
        info.setAvailable(isLessonAvailable(l, purchaseDate));
        return info;
    }

    private CourseDto.CourseResponse buildCourseResponse(Course course, User user) {
        CourseDto.CourseResponse response = new CourseDto.CourseResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setPrice(course.getPrice());
        response.setThumbnailUrl(course.getThumbnailUrl());
        response.setCreatedBy(course.getCreatedBy());
        response.setCreatedAt(course.getCreatedAt());
        response.setStatus(course.getStatus() != null ? course.getStatus().name() : null);
        response.setEnrollmentType(course.getEnrollmentType() != null ? course.getEnrollmentType().name() : null);
        response.setCapacityLimit(course.getCapacityLimit());
        response.setEnrolledCount((int) courseRepository.countEnrolled(course.getId()));
        response.setCategories(course.getCategories().stream().map(Category::getName).collect(Collectors.toList()));
        response.setTags(course.getTags().stream().map(Tag::getName).collect(Collectors.toList()));

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(course.getId());
        response.setLessonCount(lessons.size());

        boolean isFree = course.getPrice() != null && course.getPrice().compareTo(BigDecimal.ZERO) == 0;
        // purchased and progress are only set for authenticated users
        if (user != null) {
            if (isFree) {
                response.setPurchased(true);
                response.setProgressPercentage(calculateProgress(user.getId(), course.getId(), lessons));
            } else {
                boolean purchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                        user.getId(), course.getId(), Purchase.PurchaseStatus.COMPLETED);
                response.setPurchased(purchased);
                if (purchased) response.setProgressPercentage(calculateProgress(user.getId(), course.getId(), lessons));
            }
        }
        // user == null → purchased stays false, progressPercentage stays null
        return response;
    }

    private Integer calculateProgress(Long userId, Long courseId, List<Lesson> lessons) {
        if (lessons.isEmpty()) return 0;
        long done = progressRepository.findByUserIdAndCourseId(userId, courseId)
                .stream().filter(p -> p.getCompleted()).count();
        return (int) ((done * 100) / lessons.size());
    }

    private void applyCategories(Course course, List<Long> categoryIds) {
        course.getCategories().clear();
        if (categoryIds != null) {
            categoryIds.forEach(id -> categoryRepository.findById(id).ifPresent(course.getCategories()::add));
        }
    }

    private void applyTags(Course course, List<Long> tagIds) {
        course.getTags().clear();
        if (tagIds != null) {
            tagIds.forEach(id -> tagRepository.findById(id).ifPresent(course.getTags()::add));
        }
    }

    private void applyPrerequisites(Long courseId, List<Long> prereqIds) {
        // Delete existing and re-add
        prerequisiteRepository.findByCourseId(courseId)
                .forEach(p -> prerequisiteRepository.deleteById(p.getId()));
        if (prereqIds != null) {
            prereqIds.forEach(pid -> {
                if (!pid.equals(courseId)) {
                    CoursePrerequisite cp = new CoursePrerequisite();
                    cp.setCourseId(courseId);
                    cp.setPrerequisiteCourseId(pid);
                    prerequisiteRepository.save(cp);
                }
            });
        }
    }
}
