package com.lms.users;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Paged listing by roles
    Page<User> findByRoleIn(List<User.Role> roles, Pageable pageable);

    // Paged search: name OR email within given roles
    @Query("SELECT u FROM User u WHERE u.role IN :roles AND " +
           "(LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(u.email)    LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> searchByRolesAndTerm(@Param("roles") List<User.Role> roles,
                                    @Param("search") String search,
                                    Pageable pageable);
}
