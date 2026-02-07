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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {
    
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProgressRepository progressRepository;
    
    @Transactional
    public Course createCourse(CourseDto.CreateCourseRequest request, User user) {
        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setCreatedBy(user.getId());
        
        return courseRepository.save(course);
    }
    
    @Transactional
    public Course updateCourse(Long courseId, CourseDto.UpdateCourseRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            course.setPrice(request.getPrice());
        }
        
        return courseRepository.save(course);
    }
    
    @Transactional
    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }
    
    public List<CourseDto.CourseResponse> getAllCourses(User user) {
        List<Course> courses = courseRepository.findAllByOrderByCreatedAtDesc();
        
        return courses.stream().map(course -> {
            CourseDto.CourseResponse response = new CourseDto.CourseResponse();
            response.setId(course.getId());
            response.setTitle(course.getTitle());
            response.setDescription(course.getDescription());
            response.setPrice(course.getPrice());
            response.setThumbnailUrl(course.getThumbnailUrl());
            response.setCreatedBy(course.getCreatedBy());
            response.setCreatedAt(course.getCreatedAt());
            
            List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(course.getId());
            response.setLessonCount(lessons.size());
            
            if (user != null) {
                boolean purchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                        user.getId(), course.getId(), Purchase.PurchaseStatus.COMPLETED);
                response.setPurchased(purchased);
                
                if (purchased) {
                    response.setProgressPercentage(calculateProgress(user.getId(), course.getId(), lessons));
                }
            }
            
            return response;
        }).collect(Collectors.toList());
    }
    
    public CourseDto.CourseDetailResponse getCourseById(Long courseId, User user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        List<Lesson> lessons = lessonRepository.findByCourseIdOrderByLessonOrderAsc(courseId);
        
        CourseDto.CourseDetailResponse response = new CourseDto.CourseDetailResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setPrice(course.getPrice());
        response.setThumbnailUrl(course.getThumbnailUrl());
        response.setCreatedBy(course.getCreatedBy());
        response.setCreatedAt(course.getCreatedAt());
        
        if (user != null) {
            boolean purchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                    user.getId(), courseId, Purchase.PurchaseStatus.COMPLETED);
            response.setPurchased(purchased);
            
            if (purchased) {
                response.setProgressPercentage(calculateProgress(user.getId(), courseId, lessons));
                
                var progressList = progressRepository.findByUserIdAndCourseId(user.getId(), courseId);
                var progressMap = progressList.stream()
                        .collect(Collectors.toMap(p -> p.getLessonId(), p -> p.getCompleted()));
                
                response.setLessons(lessons.stream().map(lesson -> {
                    CourseDto.LessonInfo info = new CourseDto.LessonInfo();
                    info.setId(lesson.getId());
                    info.setTitle(lesson.getTitle());
                    info.setLessonType(lesson.getLessonType().name());
                    info.setDurationSeconds(lesson.getDurationSeconds());
                    info.setCompleted(progressMap.getOrDefault(lesson.getId(), false));
                    return info;
                }).collect(Collectors.toList()));
            }
        }
        
        return response;
    }
    
    private Integer calculateProgress(Long userId, Long courseId, List<Lesson> lessons) {
        if (lessons.isEmpty()) return 0;
        
        var progressList = progressRepository.findByUserIdAndCourseId(userId, courseId);
        long completedCount = progressList.stream().filter(p -> p.getCompleted()).count();
        
        return (int) ((completedCount * 100) / lessons.size());
    }
}
