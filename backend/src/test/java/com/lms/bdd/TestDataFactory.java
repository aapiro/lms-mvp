package com.lms.bdd;

import com.lms.courses.Course;
import com.lms.courses.CourseRepository;
import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import com.lms.users.User;
import com.lms.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TestDataFactory {

    @Autowired private UserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private PurchaseRepository purchaseRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public User createUser(String email, String password, String fullName, User.Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        return userRepository.save(user);
    }

    public User createStudent(String email, String password, String fullName) {
        return createUser(email, password, fullName, User.Role.STUDENT);
    }

    public User createAdmin(String email, String password, String fullName) {
        return createUser(email, password, fullName, User.Role.ADMIN);
    }

    public Course createCourse(String title, BigDecimal price, Course.CourseStatus status, Long createdBy) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription("Descripción de " + title);
        course.setPrice(price);
        course.setStatus(status);
        course.setCreatedBy(createdBy);
        return courseRepository.save(course);
    }

    public Course createPublishedCourse(String title, BigDecimal price, Long createdBy) {
        return createCourse(title, price, Course.CourseStatus.PUBLISHED, createdBy);
    }

    public Purchase createPurchase(Long userId, Long courseId, BigDecimal amount) {
        Purchase purchase = new Purchase();
        purchase.setUserId(userId);
        purchase.setCourseId(courseId);
        purchase.setAmount(amount);
        purchase.setStatus(Purchase.PurchaseStatus.COMPLETED);
        return purchaseRepository.save(purchase);
    }
}
