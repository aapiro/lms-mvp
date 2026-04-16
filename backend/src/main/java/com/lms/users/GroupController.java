package com.lms.users;

import com.lms.config.AuditService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<UserGroup>> listGroups() {
        return ResponseEntity.ok(groupService.listGroups());
    }

    @PostMapping
    public ResponseEntity<UserGroup> createGroup(@AuthenticationPrincipal User user,
                                                  @RequestBody GroupRequest req) {
        UserGroup group = groupService.createGroup(req.getName(), req.getDescription(), user.getId());
        auditService.log(user.getId(), "CREATE_GROUP", "GROUP", group.getId().toString(),
                "{\"name\":\"" + group.getName() + "\"}");
        return ResponseEntity.ok(group);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserGroup> updateGroup(@AuthenticationPrincipal User user,
                                                  @PathVariable Long id,
                                                  @RequestBody GroupRequest req) {
        UserGroup group = groupService.updateGroup(id, req.getName(), req.getDescription());
        auditService.log(user.getId(), "UPDATE_GROUP", "GROUP", id.toString(),
                "{\"name\":\"" + req.getName() + "\"}");
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@AuthenticationPrincipal User user,
                                             @PathVariable Long id) {
        groupService.deleteGroup(id);
        auditService.log(user.getId(), "DELETE_GROUP", "GROUP", id.toString(), null);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMember>> getMembers(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getMembers(id));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@AuthenticationPrincipal User user,
                                       @PathVariable Long id,
                                       @RequestBody AddMemberRequest req) {
        GroupMember member = groupService.addMember(id, req.getUserId());
        if (member == null) {
            Map<String, String> body = new HashMap<>();
            body.put("message", "User is already a member of this group");
            return ResponseEntity.ok(body);
        }
        auditService.log(user.getId(), "ADD_GROUP_MEMBER", "GROUP", id.toString(),
                "{\"userId\":" + req.getUserId() + "}");
        return ResponseEntity.ok(member);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(@AuthenticationPrincipal User user,
                                              @PathVariable Long id,
                                              @PathVariable Long userId) {
        groupService.removeMember(id, userId);
        auditService.log(user.getId(), "REMOVE_GROUP_MEMBER", "GROUP", id.toString(),
                "{\"userId\":" + userId + "}");
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/enroll/{courseId}")
    public ResponseEntity<Map<String, Object>> enrollGroupInCourse(@AuthenticationPrincipal User user,
                                                                    @PathVariable Long id,
                                                                    @PathVariable Long courseId) {
        int enrolled = groupService.enrollGroupInCourse(id, courseId);
        auditService.log(user.getId(), "GROUP_ENROLL", "GROUP", id.toString(),
                "{\"courseId\":" + courseId + ",\"enrolled\":" + enrolled + "}");
        Map<String, Object> body = new HashMap<>();
        body.put("groupId", id);
        body.put("courseId", courseId);
        body.put("enrolledCount", enrolled);
        return ResponseEntity.ok(body);
    }

    @Data
    public static class GroupRequest {
        private String name;
        private String description;
    }

    @Data
    public static class AddMemberRequest {
        private Long userId;
    }
}
