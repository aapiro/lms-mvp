package com.lms.courses;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    // ── Categories ──────────────────────────────────────────────────

    public List<CategoryDto.CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public CategoryDto.CategoryResponse getCategoryById(Long id) {
        return toResponse(categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id)));
    }

    @Transactional
    public CategoryDto.CategoryResponse createCategory(CategoryDto.CategoryRequest req) {
        if (categoryRepository.findBySlug(req.getSlug()).isPresent())
            throw new RuntimeException("Slug already in use: " + req.getSlug());
        Category c = new Category();
        c.setName(req.getName());
        c.setSlug(req.getSlug());
        c.setDescription(req.getDescription());
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public CategoryDto.CategoryResponse updateCategory(Long id, CategoryDto.CategoryRequest req) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
        if (req.getName() != null) c.setName(req.getName());
        if (req.getSlug() != null) c.setSlug(req.getSlug());
        if (req.getDescription() != null) c.setDescription(req.getDescription());
        return toResponse(categoryRepository.save(c));
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDto.CategoryResponse toResponse(Category c) {
        CategoryDto.CategoryResponse r = new CategoryDto.CategoryResponse();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setSlug(c.getSlug());
        r.setDescription(c.getDescription());
        return r;
    }

    // ── Tags ────────────────────────────────────────────────────────

    public List<CategoryDto.TagResponse> getAllTags() {
        return tagRepository.findAllByOrderByNameAsc().stream()
                .map(this::toTagResponse).collect(Collectors.toList());
    }

    public CategoryDto.TagResponse getTagById(Long id) {
        return toTagResponse(tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found: " + id)));
    }

    @Transactional
    public CategoryDto.TagResponse createTag(CategoryDto.TagRequest req) {
        if (tagRepository.findBySlug(req.getSlug()).isPresent())
            throw new RuntimeException("Tag slug already in use: " + req.getSlug());
        Tag t = new Tag();
        t.setName(req.getName());
        t.setSlug(req.getSlug());
        return toTagResponse(tagRepository.save(t));
    }

    @Transactional
    public CategoryDto.TagResponse updateTag(Long id, CategoryDto.TagRequest req) {
        Tag t = tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found: " + id));
        if (req.getName() != null) t.setName(req.getName());
        if (req.getSlug() != null) t.setSlug(req.getSlug());
        return toTagResponse(tagRepository.save(t));
    }

    @Transactional
    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }

    private CategoryDto.TagResponse toTagResponse(Tag t) {
        CategoryDto.TagResponse r = new CategoryDto.TagResponse();
        r.setId(t.getId());
        r.setName(t.getName());
        r.setSlug(t.getSlug());
        return r;
    }
}

