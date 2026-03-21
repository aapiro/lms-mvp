package com.lms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.time.LocalDate;
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

        // --- new KPIs ---
        r.put("activeUsersCount", getActiveUsersCount());
        r.put("coursesInProgress", getCoursesInProgress());
        r.put("completionRate", getCompletionRate());
        r.put("revenueSummary", getRevenueSummary());

        return r;
    }

    public int getActiveUsersCount() {
        String sql = "SELECT COUNT(DISTINCT user_id) FROM (" +
                "  SELECT user_id FROM progress WHERE updated_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'" +
                "  UNION" +
                "  SELECT user_id FROM submissions WHERE submitted_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'" +
                ") AS active";
        Integer count = jdbc.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    public int getCoursesInProgress() {
        String sql =
            "WITH enrollments AS (" +
            "  SELECT DISTINCT user_id, course_id FROM purchases WHERE status = 'COMPLETED'" +
            "), lesson_counts AS (" +
            "  SELECT course_id, COUNT(*) AS total FROM lessons GROUP BY course_id" +
            "), user_done AS (" +
            "  SELECT e.user_id, e.course_id, COUNT(pr.id) AS done" +
            "  FROM enrollments e" +
            "  LEFT JOIN progress pr ON pr.user_id = e.user_id" +
            "    AND pr.lesson_id IN (SELECT id FROM lessons WHERE course_id = e.course_id)" +
            "    AND pr.completed = true" +
            "  GROUP BY e.user_id, e.course_id" +
            ") " +
            "SELECT COUNT(DISTINCT ud.course_id) " +
            "FROM user_done ud " +
            "JOIN lesson_counts lc ON lc.course_id = ud.course_id " +
            "WHERE ud.done < lc.total";
        Integer count = jdbc.queryForObject(sql, Integer.class);
        return count != null ? count : 0;
    }

    public double getCompletionRate() {
        String sql =
            "WITH enrollments AS (" +
            "  SELECT user_id, course_id FROM purchases WHERE status = 'COMPLETED'" +
            "), lesson_counts AS (" +
            "  SELECT course_id, COUNT(*) AS total FROM lessons GROUP BY course_id" +
            "), completed_counts AS (" +
            "  SELECT e.user_id, e.course_id, COUNT(pr.id) AS done" +
            "  FROM enrollments e" +
            "  LEFT JOIN lessons l ON l.course_id = e.course_id" +
            "  LEFT JOIN progress pr ON pr.user_id = e.user_id AND pr.lesson_id = l.id AND pr.completed = true" +
            "  GROUP BY e.user_id, e.course_id" +
            ")" +
            "SELECT CASE WHEN COUNT(*) = 0 THEN 0" +
            "  ELSE ROUND(100.0 * SUM(CASE WHEN cc.done >= lc.total THEN 1 ELSE 0 END) / COUNT(*), 1)" +
            "  END AS rate" +
            " FROM completed_counts cc" +
            " JOIN lesson_counts lc ON lc.course_id = cc.course_id";
        Double rate = jdbc.queryForObject(sql, Double.class);
        return rate != null ? rate : 0.0;
    }

    public Map<String, Object> getRevenueSummary() {
        String sqlCurrent = "SELECT COALESCE(SUM((amount*100)::bigint), 0) FROM purchases " +
                "WHERE date_trunc('month', purchased_at) = date_trunc('month', CURRENT_DATE) " +
                "AND status = 'COMPLETED'";
        String sqlPrev = "SELECT COALESCE(SUM((amount*100)::bigint), 0) FROM purchases " +
                "WHERE date_trunc('month', purchased_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month') " +
                "AND status = 'COMPLETED'";

        Long currentCents = jdbc.queryForObject(sqlCurrent, Long.class);
        Long prevCents = jdbc.queryForObject(sqlPrev, Long.class);
        if (currentCents == null) currentCents = 0L;
        if (prevCents == null) prevCents = 0L;

        double changePercent = 0.0;
        if (prevCents > 0) {
            changePercent = BigDecimal.valueOf((currentCents - prevCents) * 100.0 / prevCents)
                    .setScale(1, RoundingMode.HALF_UP).doubleValue();
        } else if (currentCents > 0) {
            changePercent = 100.0;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("currentMonthCents", currentCents);
        result.put("previousMonthCents", prevCents);
        result.put("changePercent", changePercent);
        return result;
    }

    public List<Map<String, Object>> getEnrollmentsTimeSeries(LocalDate from, LocalDate to) {
        String sql = "SELECT DATE(purchased_at) as day, COUNT(*) AS enrollments " +
                "FROM purchases WHERE purchased_at >= ? AND purchased_at <= ? AND status = 'COMPLETED' " +
                "GROUP BY day ORDER BY day";
        List<Map<String, Object>> rows = jdbc.query(sql,
                new Object[]{from.atStartOfDay(), to.atTime(23, 59, 59)},
                (ResultSet rs, int rowNum) -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("date", rs.getDate("day").toLocalDate().toString());
                    m.put("enrollments", rs.getInt("enrollments"));
                    return m;
                });

        // fill missing days
        List<Map<String, Object>> filled = new ArrayList<>();
        LocalDate cur = from;
        while (!cur.isAfter(to)) {
            final String curStr = cur.toString();
            Optional<Map<String, Object>> found = rows.stream().filter(r -> r.get("date").equals(curStr)).findFirst();
            if (found.isPresent()) {
                filled.add(found.get());
            } else {
                Map<String, Object> m = new HashMap<>();
                m.put("date", curStr);
                m.put("enrollments", 0);
                filled.add(m);
            }
            cur = cur.plusDays(1);
        }
        return filled;
    }

    public List<Map<String, Object>> getTopPerformingCourses(String metric, int limit) {
        if (limit <= 0) limit = 10;
        List<Map<String, Object>> results;

        if ("completion_rate".equals(metric)) {
            String sql =
                "WITH enrollments AS (" +
                "  SELECT user_id, course_id FROM purchases WHERE status = 'COMPLETED'" +
                "), lesson_counts AS (" +
                "  SELECT course_id, COUNT(*) AS total FROM lessons GROUP BY course_id" +
                "), completed_counts AS (" +
                "  SELECT e.user_id, e.course_id, COUNT(pr.id) AS done" +
                "  FROM enrollments e" +
                "  LEFT JOIN lessons l ON l.course_id = e.course_id" +
                "  LEFT JOIN progress pr ON pr.user_id = e.user_id AND pr.lesson_id = l.id AND pr.completed = true" +
                "  GROUP BY e.user_id, e.course_id" +
                "), course_rates AS (" +
                "  SELECT cc.course_id," +
                "    CASE WHEN COUNT(*) = 0 THEN 0" +
                "    ELSE ROUND(100.0 * SUM(CASE WHEN cc.done >= lc.total THEN 1 ELSE 0 END) / COUNT(*), 1)" +
                "    END AS value" +
                "  FROM completed_counts cc" +
                "  JOIN lesson_counts lc ON lc.course_id = cc.course_id" +
                "  GROUP BY cc.course_id" +
                ")" +
                "SELECT cr.course_id, COALESCE(c.title, '') AS title, cr.value" +
                " FROM course_rates cr" +
                " JOIN courses c ON c.id = cr.course_id" +
                " ORDER BY cr.value DESC" +
                " LIMIT ?";
            results = jdbc.query(sql, new Object[]{limit}, (ResultSet rs, int rowNum) -> {
                Map<String, Object> m = new HashMap<>();
                m.put("courseId", rs.getLong("course_id"));
                m.put("title", rs.getString("title"));
                m.put("value", rs.getDouble("value"));
                return m;
            });
        } else {
            // default: enrollments
            String sql = "SELECT p.course_id, COALESCE(c.title, '') AS title, COUNT(*) AS value " +
                    "FROM purchases p JOIN courses c ON c.id = p.course_id " +
                    "WHERE p.status = 'COMPLETED' " +
                    "GROUP BY p.course_id, c.title " +
                    "ORDER BY value DESC LIMIT ?";
            results = jdbc.query(sql, new Object[]{limit}, (ResultSet rs, int rowNum) -> {
                Map<String, Object> m = new HashMap<>();
                m.put("courseId", rs.getLong("course_id"));
                m.put("title", rs.getString("title"));
                m.put("value", rs.getLong("value"));
                return m;
            });
        }
        return results;
    }

    public List<Map<String, Object>> getUserActivityHeatmap(int days) {
        if (days <= 0) days = 30;
        LocalDate since = LocalDate.now().minusDays(days);
        String sql =
            "SELECT EXTRACT(DOW FROM ts)::int AS dow, EXTRACT(HOUR FROM ts)::int AS hour, COUNT(*) AS count" +
            " FROM (" +
            "   SELECT updated_at AS ts FROM progress WHERE updated_at >= ?" +
            "   UNION ALL" +
            "   SELECT submitted_at AS ts FROM submissions WHERE submitted_at >= ?" +
            " ) events" +
            " GROUP BY dow, hour ORDER BY dow, hour";
        return jdbc.query(sql, new Object[]{since, since}, (ResultSet rs, int rowNum) -> {
            Map<String, Object> m = new HashMap<>();
            m.put("dow", rs.getInt("dow"));
            m.put("hour", rs.getInt("hour"));
            m.put("count", rs.getInt("count"));
            return m;
        });
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
