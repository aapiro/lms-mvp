package com.lms.users;

import com.lms.payments.Purchase;
import com.lms.payments.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final UserGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final PurchaseRepository purchaseRepository;

    public UserGroup createGroup(String name, String description, Long createdBy) {
        UserGroup group = new UserGroup();
        group.setName(name);
        group.setDescription(description);
        group.setCreatedBy(createdBy);
        return groupRepository.save(group);
    }

    public UserGroup updateGroup(Long groupId, String name, String description) {
        UserGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found: " + groupId));
        if (name != null) group.setName(name);
        if (description != null) group.setDescription(description);
        return groupRepository.save(group);
    }

    @Transactional
    public void deleteGroup(Long groupId) {
        groupRepository.deleteById(groupId);
    }

    public List<UserGroup> listGroups() {
        return groupRepository.findAll();
    }

    public UserGroup getGroup(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found: " + groupId));
    }

    public long getMemberCount(Long groupId) {
        return memberRepository.findByGroupId(groupId).size();
    }

    public GroupMember addMember(Long groupId, Long userId) {
        if (memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            return null; // already a member
        }
        GroupMember member = new GroupMember();
        member.setGroupId(groupId);
        member.setUserId(userId);
        return memberRepository.save(member);
    }

    @Transactional
    public void removeMember(Long groupId, Long userId) {
        memberRepository.deleteByGroupIdAndUserId(groupId, userId);
    }

    public List<GroupMember> getMembers(Long groupId) {
        return memberRepository.findByGroupId(groupId);
    }

    @Transactional
    public int enrollGroupInCourse(Long groupId, Long courseId) {
        List<GroupMember> members = memberRepository.findByGroupId(groupId);
        int enrolled = 0;
        for (GroupMember member : members) {
            boolean alreadyPurchased = purchaseRepository.existsByUserIdAndCourseIdAndStatus(
                    member.getUserId(), courseId, Purchase.PurchaseStatus.COMPLETED);
            if (!alreadyPurchased) {
                Purchase purchase = new Purchase();
                purchase.setUserId(member.getUserId());
                purchase.setCourseId(courseId);
                purchase.setAmount(BigDecimal.ZERO);
                purchase.setStatus(Purchase.PurchaseStatus.COMPLETED);
                purchaseRepository.save(purchase);
                enrolled++;
            }
        }
        return enrolled;
    }
}
