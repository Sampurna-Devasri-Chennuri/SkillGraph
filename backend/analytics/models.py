from django.db import models
from django.contrib.auth.models import User

class UserActivity(models.Model):
    ACTION_TYPES = [
        ('SKILL_ADDED', 'Skill Added'),
        ('SKILL_UPDATED', 'Skill Proficiency Updated'),
        ('PATH_GENERATED', 'Learning Path Generated'),
        ('PATH_STEP_COMPLETED', 'Roadmap Milestone Completed'),
        ('PROJECT_ADDED', 'Project Added to Portfolio'),
        ('SIMULATION_RUN', 'Career Simulation Executed'),
        ('CAREER_TARGET_SET', 'Career Target Selected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=40, choices=ACTION_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'User Activities'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.action_type} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"
