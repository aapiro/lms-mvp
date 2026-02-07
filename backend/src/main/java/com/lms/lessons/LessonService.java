package com.lms.lessons;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.storage.StorageService;
import com.lms.users.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {
    
    private final LessonRepository lessonRepository;
    private final PurchaseRepository purchaseRepository;
    private final StorageService storageService;
    
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
        
        // Verificar que el usuario compró el curso
        boolean hasPurchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                user.getId(), lesson.getCourseId(), Purchase.PurchaseStatus.COMPLETED);
        
        if (!hasPurchased) {
            throw new RuntimeException("You must purchase this course to access lessons");
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
        
        return response;
    }
    
    public List<Lesson> getLessonsByCourse(Long courseId) {
        return lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
    }
}
