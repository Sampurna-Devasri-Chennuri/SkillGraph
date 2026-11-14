from django.db import models
from django.contrib.auth.models import User
from careers.models import CareerRole
from skills.models import Skill

class LearningPath(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_paths')
    target_career = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='generated_paths')
    title = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    total_steps = models.IntegerField(default=0)
    completed_steps = models.IntegerField(default=0)
    estimated_total_hours = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_active', '-created_at']

    def update_progress(self):
        steps = self.steps.all()
        self.total_steps = steps.count()
        self.completed_steps = steps.filter(status='COMPLETED').count()
        self.save(update_fields=['total_steps', 'completed_steps'])

    def __str__(self):
        return f"{self.user.username}'s Roadmap to {self.target_career.title} ({self.completed_steps}/{self.total_steps})"


class LearningPathStep(models.Model):
    STATUS_CHOICES = [
        ('LOCKED', 'Locked (Prerequisites Pending)'),
        ('AVAILABLE', 'Available to Learn'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed / Demonstrated'),
    ]

    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='steps')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='learning_path_steps')
    sequence_order = models.IntegerField(help_text="Topological order step 1, 2, 3...")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='LOCKED')
    estimated_hours = models.IntegerField(default=20)
    is_core = models.BooleanField(default=True)
    suggested_activities = models.JSONField(
        default=list,
        help_text="Concrete hands-on tasks and mini-projects to demonstrate mastery"
    )
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sequence_order']
        unique_together = ('learning_path', 'skill')

    def __str__(self):
        return f"Step {self.sequence_order}: {self.skill.name} [{self.status}]"
