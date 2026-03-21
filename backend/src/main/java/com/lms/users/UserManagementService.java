package com.lms.users;

import com.lms.config.AuditService;
import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.lessons.Lesson;
import com.lms.lessons.LessonRepository;
import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.progress.Progress;
import com.lms.progress.ProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final CertificateRepository certificateRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final AuditService auditService;

    // Roles considerados "estudiante" (incluye legacy USER)
    private static final List<User.Role> STUDENT_ROLES =
            List.of(User.Role.STUDENT, User.Role.USER);
    private static final List<User.Role> INSTRUCTOR_ROLES =
            List.of(User.Role.INSTRUCTOR);

    // ──────────────────────────────────────────────────────────────
    // STUDENTS
    // ──────────────────────────────────────────────────────────────

    public Page<UserManagementDto.UserSummaryDto> listStudents(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.searchByRolesAndTerm(STUDENT_ROLES, search.trim(), pageable);
        } else {
            users = userRepository.findByRoleIn(STUDENT_ROLES, pageable);
        }
        return users.map(UserManagementDto.UserSummaryDto::from);
    }

    public UserManagementDto.StudentDetailDto getStudentDetail(Long studentId) {
        User student = findUser(studentId);

        UserManagementDto.StudentDetailDto dto = new UserManagementDto.StudentDetailDto();
        dto.setId(student.getId());
        dto.setEmail(student.getEmail());
        dto.setFullName(student.getFullName());
        dto.setBio(student.getBio());
        dto.setAvatarUrl(student.getAvatarUrl());
        dto.setIsActive(student.getIsActive());
        dto.setCreatedAt(student.getCreatedAt());
        dto.setLastLogin(student.getLastLogin());

        // Enrollment history
        List<Purchase> purchases = purchaseRepository
                .findByUserIdAndStatus(studentId, Purchase.PurchaseStatus.COMPLETED);
        dto.setEnrollments(purchases.stream().map(p -> buildEnrollmentDto(studentId, p))
                .collect(Collectors.toList()));

        // Certificates
        dto.setCertificates(certificateRepository.findByUserId(studentId).stream()
                .map(c -> buildCertificateDto(c))
                .collect(Collectors.toList()));

        return dto;
    }

    public List<UserManagementDto.StudentProgressDto> getStudentProgress(Long studentId) {
        findUser(studentId); // validate exists
        List<Purchase> purchases = purchaseRepository
                .findByUserIdAndStatus(studentId, Purchase.PurchaseStatus.COMPLETED);
        return purchases.stream()
                .map(p -> buildProgressDto(studentId, p.getCourseId()))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────
    // INSTRUCTORS
    // ──────────────────────────────────────────────────────────────

    public Page<UserManagementDto.UserSummaryDto> listInstructors(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.searchByRolesAndTerm(INSTRUCTOR_ROLES, search.trim(), pageable);
        } else {
            users = userRepository.findByRoleIn(INSTRUCTOR_ROLES, pageable);
        }
        return users.map(UserManagementDto.UserSummaryDto::from);
    }

    public UserManagementDto.InstructorDetailDto getInstructorDetail(Long instructorId) {
        User instructor = findUser(instructorId);

        UserManagementDto.InstructorDetailDto dto = new UserManagementDto.InstructorDetailDto();
        dto.setId(instructor.getId());
        dto.setEmail(instructor.getEmail());
        dto.setFullName(instructor.getFullName());
        dto.setBio(instructor.getBio());
        dto.setAvatarUrl(instructor.getAvatarUrl());
        dto.setIsActive(instructor.getIsActive());
        dto.setCreatedAt(instructor.getCreatedAt());
        dto.setLastLogin(instructor.getLastLogin());

        // Assigned courses with performance metrics
        List<Course> courses = courseRepository.findByCreatedBy(instructorId);
        dto.setAssignedCourses(courses.stream().map(c -> buildCourseMetrics(c))
                .collect(Collectors.toList()));

        return dto;
    }

    // ──────────────────────────────────────────────────────────────
    // PROFILE EDIT (students & instructors)
    // ──────────────────────────────────────────────────────────────

    @Transactional
    public UserManagementDto.UserSummaryDto updateProfile(Long userId,
            UserManagementDto.ProfileUpdateRequest req, User actor) {
        User user = findUser(userId);
        if (req.getFullName() != null && !req.getFullName().isBlank())
            user.setFullName(req.getFullName());
        if (req.getBio() != null)
            user.setBio(req.getBio());
        if (req.getAvatarUrl() != null)
            user.setAvatarUrl(req.getAvatarUrl());
        User saved = userRepository.save(user);
        auditService.log(actor.getId(), "UPDATE_USER_PROFILE", "user",
                String.valueOf(userId), "{\"fullName\":\"" + saved.getFullName() + "\"}");
        return UserManagementDto.UserSummaryDto.from(saved);
    }

    // ──────────────────────────────────────────────────────────────
    // ADMIN MANAGEMENT
    // ──────────────────────────────────────────────────────────────

    @Transactional
    public void changeUserRole(Long userId, String newRoleStr, User actor) {
        User user = findUser(userId);
        User.Role newRole = User.Role.valueOf(newRoleStr.toUpperCase());
        User.Role oldRole = user.getRole();
        user.setRole(newRole);
        userRepository.save(user);
        auditService.log(actor.getId(), "CHANGE_USER_ROLE", "user", String.valueOf(userId),
                "{\"oldRole\":\"" + oldRole + "\",\"newRole\":\"" + newRole + "\"}");
    }

    @Transactional
    public void setUserActive(Long userId, boolean active, User actor) {
        User user = findUser(userId);
        user.setIsActive(active);
        userRepository.save(user);
        auditService.log(actor.getId(), "SET_USER_ACTIVE", "user", String.valueOf(userId),
                "{\"isActive\":" + active + "}");
    }

    @Transactional
    public UserManagementDto.CertificateDto issueCertificate(Long userId, Long courseId, User actor) {
        findUser(userId);
        courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));

        if (certificateRepository.findByUserIdAndCourseId(userId, courseId).isPresent()) {
            throw new RuntimeException("Certificate already issued for this user/course");
        }

        Certificate cert = new Certificate();
        cert.setUserId(userId);
        cert.setCourseId(courseId);
        cert.setIssueDate(LocalDateTime.now());
        cert.setCertificateUrl("/certificates/" + UUID.randomUUID());
        Certificate saved = certificateRepository.save(cert);

        auditService.log(actor.getId(), "ISSUE_CERTIFICATE", "certificate",
                String.valueOf(saved.getId()),
                "{\"userId\":" + userId + ",\"courseId\":" + courseId + "}");
        return buildCertificateDto(saved);
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    private UserManagementDto.EnrollmentDto buildEnrollmentDto(Long userId, Purchase p) {
        UserManagementDto.EnrollmentDto e = new UserManagementDto.EnrollmentDto();
        e.setPurchaseId(p.getId());
        e.setCourseId(p.getCourseId());
        e.setAmount(p.getAmount());
        e.setPurchasedAt(p.getPurchasedAt());
        courseRepository.findById(p.getCourseId())
                .ifPresent(c -> e.setCourseTitle(c.getTitle()));

        List<Lesson> lessons = lessonRepository
                .findByCourseIdOrderByLessonOrderAsc(p.getCourseId());
        List<Progress> progress = progressRepository
                .findByUserIdAndCourseId(userId, p.getCourseId());
        long done = progress.stream()
                .filter(pr -> Boolean.TRUE.equals(pr.getCompleted())).count();
        int pct = lessons.isEmpty() ? 0 : (int) (done * 100 / lessons.size());
        e.setCompletionPercentage(pct);
        e.setStatus(pct >= 100 ? "COMPLETED" : done > 0 ? "ACTIVE" : "NOT_STARTED");
        return e;
    }

    private UserManagementDto.StudentProgressDto buildProgressDto(Long userId, Long courseId) {
        UserManagementDto.StudentProgressDto d = new UserManagementDto.StudentProgressDto();
        d.setCourseId(courseId);
        courseRepository.findById(courseId).ifPresent(c -> d.setCourseTitle(c.getTitle()));

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
        List<Progress> progressList = progressRepository.findByUserIdAndCourseId(userId, courseId);
        long done = progressList.stream()
                .filter(pr -> Boolean.TRUE.equals(pr.getCompleted())).count();
        int pct = lessons.isEmpty() ? 0 : (int) (done * 100 / lessons.size());

        d.setCompletedLessons((int) done);
        d.setTotalLessons(lessons.size());
        d.setCompletionPercentage(pct);
        d.setStatus(pct >= 100 ? "COMPLETED" : done > 0 ? "ACTIVE" : "NOT_STARTED");

        progressList.stream()
                .filter(pr -> pr.getCompletedAt() != null)
                .max(Comparator.comparing(Progress::getCompletedAt))
                .ifPresent(pr -> d.setLastActivity(pr.getCompletedAt()));
        return d;
    }

    private UserManagementDto.CertificateDto buildCertificateDto(Certificate c) {
        UserManagementDto.CertificateDto dto = new UserManagementDto.CertificateDto();
        dto.setId(c.getId());
        dto.setCourseId(c.getCourseId());
        dto.setIssueDate(c.getIssueDate());
        dto.setCertificateUrl(c.getCertificateUrl());
        courseRepository.findById(c.getCourseId())
                .ifPresent(course -> dto.setCourseTitle(course.getTitle()));
        return dto;
    }

    private UserManagementDto.CourseMetricsDto buildCourseMetrics(Course c) {
        UserManagementDto.CourseMetricsDto cm = new UserManagementDto.CourseMetricsDto();
        cm.setId(c.getId());
        cm.setTitle(c.getTitle());

        List<Purchase> enrollments = purchaseRepository
                .findByCourseIdAndStatus(c.getId(), Purchase.PurchaseStatus.COMPLETED);
        cm.setTotalEnrollments(enrollments.size());

        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(c.getId());
        int activeCount = 0, completedCount = 0, totalPct = 0;

        for (Purchase p : enrollments) {
            List<Progress> progress = progressRepository
                    .findByUserIdAndCourseId(p.getUserId(), c.getId());
            long done = progress.stream()
                    .filter(pr -> Boolean.TRUE.equals(pr.getCompleted())).count();
            int pct = lessons.isEmpty() ? 0 : (int) (done * 100 / lessons.size());
            totalPct += pct;
            if (pct >= 100) completedCount++;
            else if (done > 0) activeCount++;
        }

        cm.setActiveStudents(activeCount);
        cm.setCompletedStudents(completedCount);
        cm.setAvgCompletionRate(enrollments.isEmpty() ? 0 : totalPct / enrollments.size());
        return cm;
    }
}


