-- Gamification: XP, badges, streaks, leaderboard

CREATE TABLE user_xp (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    source_type VARCHAR(50),       -- LESSON_COMPLETE, ASSESSMENT_PASS, COURSE_COMPLETE, STREAK, REVIEW, LOGIN
    source_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_user_xp_user ON user_xp(user_id, created_at DESC);

CREATE TABLE user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    badge_key VARCHAR(100) NOT NULL,
    badge_name VARCHAR(255) NOT NULL,
    badge_description TEXT,
    badge_icon VARCHAR(10),
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_key)
);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);

CREATE TABLE user_streaks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id),
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE leaderboard_cache (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total_xp BIGINT NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    rank INTEGER,
    period VARCHAR(20) NOT NULL DEFAULT 'all_time',  -- 'weekly', 'monthly', 'all_time'
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leaderboard_period_rank ON leaderboard_cache(period, total_xp DESC);
CREATE UNIQUE INDEX idx_leaderboard_user_period ON leaderboard_cache(user_id, period);
