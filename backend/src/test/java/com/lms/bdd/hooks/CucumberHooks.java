package com.lms.bdd.hooks;

import io.cucumber.java.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

public class CucumberHooks {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Before
    public void cleanDatabase() {
        // Clean test data in correct order (respect FK constraints)
        // Skip seeded data from Flyway migrations by only deleting test-created rows
        jdbcTemplate.execute("DELETE FROM certificates");
        jdbcTemplate.execute("DELETE FROM active_sessions");
        jdbcTemplate.execute("DELETE FROM error_log");
        jdbcTemplate.execute("DELETE FROM request_metrics");
        jdbcTemplate.execute("DELETE FROM security_events");
        jdbcTemplate.execute("DELETE FROM password_reset_tokens");
        jdbcTemplate.execute("DELETE FROM tutor_messages");
        jdbcTemplate.execute("DELETE FROM tutor_conversations");
        jdbcTemplate.execute("DELETE FROM user_xp");
        jdbcTemplate.execute("DELETE FROM user_badges");
        jdbcTemplate.execute("DELETE FROM user_streaks");
        jdbcTemplate.execute("DELETE FROM leaderboard_cache");
        jdbcTemplate.execute("DELETE FROM notifications");
        jdbcTemplate.execute("DELETE FROM reviews");
        jdbcTemplate.execute("DELETE FROM grades");
        jdbcTemplate.execute("DELETE FROM submissions");
        jdbcTemplate.execute("DELETE FROM questions");
        jdbcTemplate.execute("DELETE FROM assessments");
        jdbcTemplate.execute("DELETE FROM progress");
        jdbcTemplate.execute("DELETE FROM waitlist");
        jdbcTemplate.execute("DELETE FROM user_group_members");
        jdbcTemplate.execute("DELETE FROM user_groups");
        jdbcTemplate.execute("DELETE FROM purchases");
        jdbcTemplate.execute("DELETE FROM lessons");
        jdbcTemplate.execute("DELETE FROM modules");
        jdbcTemplate.execute("DELETE FROM course_prerequisites");
        jdbcTemplate.execute("DELETE FROM course_categories");
        jdbcTemplate.execute("DELETE FROM course_tags");
        jdbcTemplate.execute("DELETE FROM courses");
        // Test users all use @test.com emails; keep Flyway-seeded demo users
        jdbcTemplate.execute("DELETE FROM users WHERE email LIKE '%@test.com'");
    }
}
