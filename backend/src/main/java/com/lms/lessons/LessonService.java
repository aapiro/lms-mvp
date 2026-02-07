package com.lms.lessons;

import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.progress.ProgressRepository;
import com.lms.storage.StorageService;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {
    
    private final LessonRepository lessonRepository;
    private final PurchaseRepository purchaseRepository;
    private final StorageService storageService;
    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;

    @Transactional
    public Lesson createLesson(
            Long courseId,
            LessonDto.CreateLessonRequest request,
            MultipartFile file
    ) {
        // Determinar tipo según archivo
        String contentType = file.getContentType();
        Lesson.LessonType type;
        
        if (contentType != null && contentType.startsWith("video/")) {
            type = Lesson.LessonType.VIDEO;
        } else if (contentType != null && contentType.equals("application/pdf")) {
            type = Lesson.LessonType.PDF;
        } else {
            throw new RuntimeException("Invalid file type. Only videos and PDFs are supported.");
        }
        
        // Subir archivo a MinIO
        String folder = type == Lesson.LessonType.VIDEO ? "videos" : "pdfs";
        String fileKey = storageService.uploadFile(file, folder);
        
        Lesson lesson = new Lesson();
        lesson.setCourseId(courseId);
        lesson.setTitle(request.getTitle());
        lesson.setLessonOrder(request.getLessonOrder());
        lesson.setLessonType(type);
        lesson.setFileKey(fileKey);
        lesson.setDurationSeconds(request.getDurationSeconds());
        
        return lessonRepository.save(lesson);
    }
    
    @Transactional
    public void deleteLesson(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        storageService.deleteFile(lesson.getFileKey());
        lessonRepository.delete(lesson);
    }
    
    public LessonDto.LessonResponse getLessonWithUrl(Long lessonId, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        // Allow access if course is free (price == 0)
        Course course = courseRepository.findById(lesson.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        boolean isFree = course.getPrice() != null && course.getPrice().compareTo(BigDecimal.ZERO) == 0;

        if (!isFree) {
            // For non-free courses, user must be authenticated and have purchased
            if (user == null) {
                throw new RuntimeException("You must purchase this course to access lessons");
            }

            boolean hasPurchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                    user.getId(), lesson.getCourseId(), Purchase.PurchaseStatus.COMPLETED);

            if (!hasPurchased) {
                throw new RuntimeException("You must purchase this course to access lessons");
            }
        }
        
        // Generar URL firmada (válida por 60 minutos)
        String presignedUrl = storageService.getPresignedUrl(lesson.getFileKey(), 60);
        
        LessonDto.LessonResponse response = new LessonDto.LessonResponse();
        response.setId(lesson.getId());
        response.setCourseId(lesson.getCourseId());
        response.setTitle(lesson.getTitle());
        response.setLessonOrder(lesson.getLessonOrder());
        response.setLessonType(lesson.getLessonType().name());
        response.setDurationSeconds(lesson.getDurationSeconds());
        response.setFileUrl(presignedUrl);
        // If user is authenticated, set completed flag from progress table
        if (user != null) {
            var opt = progressRepository.findByUserIdAndLessonId(user.getId(), lessonId);
            response.setCompleted(opt.map(p -> Boolean.TRUE.equals(p.getCompleted())).orElse(false));
        } else {
            response.setCompleted(false);
        }

        return response;
    }
    
    public List<Lesson> getLessonsByCourse(Long courseId) {
        return lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
    }

    // New helper to get raw file_key for streaming
    public String getFileKey(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        return lesson.getFileKey();
    }
}
