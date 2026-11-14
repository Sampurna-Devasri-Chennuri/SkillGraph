from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class SkillCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='Layers')
    color_hex = models.CharField(max_length=20, default='#3b82f6')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Skill Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Skill(models.Model):
    DIFFICULTY_LEVELS = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    description = models.TextField()
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_LEVELS, default='Beginner')
    importance_weight = models.FloatField(default=1.0, help_text="Relative weighting in career competencies (1.0 to 3.0)")
    icon_name = models.CharField(max_length=50, blank=True, default='Code')
    tags = models.CharField(max_length=255, blank=True, default='', help_text="Comma-separated keywords for NLP matching")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class SkillDependency(models.Model):
    DEPENDENCY_TYPES = [
        ('STRICT_PREREQUISITE', 'Strict Prerequisite (Must know first)'),
        ('RECOMMENDED', 'Recommended (Helpful foundation)'),
        ('CO_REQUISITE', 'Co-requisite (Learned concurrently)'),
    ]

    source_skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='dependent_edges',
        help_text="The foundational prerequisite skill"
    )
    target_skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='prerequisite_edges',
        help_text="The advanced skill that requires source_skill"
    )
    dependency_type = models.CharField(max_length=30, choices=DEPENDENCY_TYPES, default='STRICT_PREREQUISITE')
    strength = models.IntegerField(default=4, help_text="Scale 1-5")
    reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Skill Dependencies'
        unique_together = ('source_skill', 'target_skill')

    def __str__(self):
        return f"{self.source_skill.name} -> {self.target_skill.name} ({self.dependency_type})"


class LearningResource(models.Model):
    RESOURCE_TYPES = [
        ('DOCUMENTATION', 'Official Documentation'),
        ('COURSE', 'Course / Tutorial'),
        ('BOOK', 'Book'),
        ('VIDEO', 'Interactive / Video Guide'),
        ('REPOSITORY', 'Open Source / Reference Code'),
    ]

    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    url = models.URLField(max_length=500)
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPES, default='DOCUMENTATION')
    provider = models.CharField(max_length=100, blank=True, default='')
    is_free = models.BooleanField(default=True)
    estimated_hours = models.IntegerField(default=10)

    def __str__(self):
        return f"{self.title} ({self.skill.name})"


class UserSkill(models.Model):
    STATUS_CHOICES = [
        ('WANT_TO_LEARN', 'Want to Learn'),
        ('LEARNING', 'Currently Learning'),
        ('PRACTICED', 'Practiced'),
        ('DEMONSTRATED', 'Demonstrated / Proficient'),
    ]

    PROFICIENCY_LEVELS = [
        (1, 'Familiar (Theoretical awareness)'),
        (2, 'Practiced (Built basic exercises)'),
        (3, 'Demonstrated (Built production or portfolio projects)'),
        (4, 'Mastered (Deep architectural and debugging expertise)'),
    ]

    VERIFICATION_SOURCES = [
        ('SELF_ASSESSED', 'Self-Reported'),
        ('PROJECT_EVIDENCED', 'Project Evidenced'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='user_competencies')
    proficiency_level = models.IntegerField(choices=PROFICIENCY_LEVELS, default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='LEARNING')
    verification_source = models.CharField(max_length=30, choices=VERIFICATION_SOURCES, default='SELF_ASSESSED')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'skill')
        ordering = ['-proficiency_level', 'skill__name']

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.get_status_display()})"
