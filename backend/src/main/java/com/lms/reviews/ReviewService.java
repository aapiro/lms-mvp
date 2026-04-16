package com.lms.reviews;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.users.User;
import com.lms.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public Review createReview(Long userId, Long courseId, int rating, String comment) {
        if (rating < 1 || rating > 5) throw new RuntimeException("Rating must be between 1 and 5");
        boolean enrolled = purchaseRepository.existsByUserIdAndCourseIdAndStatus(userId, courseId, Purchase.PurchaseStatus.COMPLETED);
        if (!enrolled) throw new RuntimeException("You must be enrolled in the course to leave a review");
        if (reviewRepository.existsByUserIdAndCourseId(userId, courseId)) throw new RuntimeException("You already reviewed this course");

        Review r = new Review();
        r.setUserId(userId);
        r.setCourseId(courseId);
        r.setRating(rating);
        r.setComment(comment);
        return reviewRepository.save(r);
    }

    public Review updateReview(Long userId, Long courseId, int rating, String comment) {
        Review r = reviewRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (rating < 1 || rating > 5) throw new RuntimeException("Rating must be between 1 and 5");
        r.setRating(rating);
        r.setComment(comment);
        return reviewRepository.save(r);
    }

    public void deleteReview(Long reviewId, Long userId) {
        Review r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!r.getUserId().equals(userId)) throw new RuntimeException("Cannot delete another user's review");
        reviewRepository.delete(r);
    }

    public void adminDeleteReview(Long reviewId) {
        reviewRepository.deleteById(reviewId);
    }

    public List<Map<String, Object>> getReviewsForCourse(Long courseId) {
        List<Review> reviews = reviewRepository.findByCourseIdOrderByCreatedAtDesc(courseId);
        return reviews.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("userId", r.getUserId());
            map.put("courseId", r.getCourseId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment());
            map.put("createdAt", r.getCreatedAt());
            userRepository.findById(r.getUserId()).ifPresent(u -> map.put("userFullName", u.getFullName()));
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Object> getCourseRating(Long courseId) {
        Double avg = reviewRepository.getAverageRating(courseId);
        int count = reviewRepository.getReviewCount(courseId);
        Map<String, Object> result = new HashMap<>();
        result.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : null);
        result.put("reviewCount", count);
        return result;
    }
}
