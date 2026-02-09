package com.lms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class MetricsService {

    private final JdbcTemplate jdbc;

    @Autowired
    public MetricsService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Cacheable(value = "metricsSummary", unless = "#result==null")
    public Map<String, Object> getSummary() {
        Map<String, Object> r = new HashMap<>();

        // users today
        Integer usersToday = jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE", Integer.class);
        r.put("usersToday", usersToday != null ? usersToday : 0);

        // newUsers7d
        Integer newUsers7d = jdbc.queryForObject("SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'", Integer.class);
        r.put("newUsers7d", newUsers7d != null ? newUsers7d : 0);

        // revenueTodayCents and revenue30dCents (store in cents to avoid float issues)
        Long revenueTodayCents = jdbc.queryForObject("SELECT COALESCE(SUM((amount*100)::bigint),0) FROM purchases WHERE DATE(purchased_at) = CURRENT_DATE AND status = 'COMPLETED'", Long.class);
        r.put("revenueTodayCents", revenueTodayCents != null ? revenueTodayCents : 0L);

        Long revenue30dCents = jdbc.queryForObject("SELECT COALESCE(SUM((amount*100)::bigint),0) FROM purchases WHERE purchased_at >= CURRENT_DATE - INTERVAL '29 days' AND status = 'COMPLETED'", Long.class);
        r.put("revenue30dCents", revenue30dCents != null ? revenue30dCents : 0L);

        // purchasesToday
        Integer purchasesToday = jdbc.queryForObject("SELECT COUNT(*) FROM purchases WHERE DATE(purchased_at) = CURRENT_DATE", Integer.class);
        r.put("purchasesToday", purchasesToday != null ? purchasesToday : 0);

        // topCourses last 30 days
        List<Map<String, Object>> topCourses = jdbc.query("SELECT course_id, COALESCE((SELECT title FROM courses c WHERE c.id = p.course_id), '') AS title, COUNT(*) AS sales_count FROM purchases p WHERE purchased_at >= CURRENT_DATE - INTERVAL '29 days' AND status = 'COMPLETED' GROUP BY course_id ORDER BY sales_count DESC LIMIT 5", (ResultSet rs, int rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("courseId", rs.getLong("course_id"));
            m.put("title", rs.getString("title"));
            m.put("salesCount", rs.getInt("sales_count"));
            return m;
        });
        r.put("topCourses", topCourses);

        return r;
    }

    public List<Map<String, Object>> getSalesTimeSeries(LocalDate from, LocalDate to, String interval) {
        // only support 'day' interval for now
        if (interval == null || !interval.equals("day")) interval = "day";

        String sql = "SELECT DATE(purchased_at) as day, COALESCE(SUM((amount*100)::bigint),0) AS revenue_cents, COUNT(*) AS sales_count FROM purchases WHERE purchased_at >= ? AND purchased_at <= ? AND status = 'COMPLETED' GROUP BY day ORDER BY day";
        List<Map<String, Object>> rows = jdbc.query(sql, new Object[]{from.atStartOfDay(), to.atTime(23,59,59)}, (ResultSet rs, int rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("date", rs.getDate("day").toLocalDate().toString());
            m.put("revenueCents", rs.getLong("revenue_cents"));
            m.put("salesCount", rs.getInt("sales_count"));
            return m;
        });

        // fill missing days
        List<Map<String, Object>> filled = new ArrayList<>();
        LocalDate cur = from;
        while (!cur.isAfter(to)) {
            final String curStr = cur.toString();
            Optional<Map<String, Object>> found = rows.stream().filter(r -> r.get("date").equals(curStr)).findFirst();
            if (found.isPresent()) filled.add(found.get()); else {
                Map<String, Object> m = new HashMap<>();
                m.put("date", curStr);
                m.put("revenueCents", 0L);
                m.put("salesCount", 0);
                filled.add(m);
            }
            cur = cur.plusDays(1);
        }
        return filled;
    }
}
