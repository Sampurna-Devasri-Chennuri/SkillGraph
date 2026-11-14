from django.db import models
from django.contrib.auth.models import User
from skills.models import Skill

class Project(models.Model):
    STATUS_CHOICES = [
        ('PLANNING', 'In Planning'),
        ('IN_PROGRESS', 'Actively Building'),
        ('COMPLETED', 'Completed & Deployed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField(help_text="Detailed description of architecture, features, and problems solved")
    technologies = models.JSONField(default=list, help_text="List of technologies, frameworks, and libraries used")
    github_url = models.URLField(max_length=400, blank=True, default='')
    live_demo_url = models.URLField(max_length=400, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='COMPLETED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.user.username}"


class ProjectSkillEvidence(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='skill_evidences')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='project_evidences')
    evidence_snippet = models.TextField(
        blank=True,
        default='',
        help_text="Explanation of how this project demonstrates proficiency in this skill"
    )
    strength_rating = models.IntegerField(default=3, help_text="Evidence confidence rating (1-5)")
    verified_by_nlp = models.BooleanField(
        default=False,
        help_text="True if mapped automatically by the skill extraction engine"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('project', 'skill')
        ordering = ['-strength_rating', 'skill__name']

    def __str__(self):
        return f"{self.project.title} -> {self.skill.name} (Rating: {self.strength_rating}/5)"
