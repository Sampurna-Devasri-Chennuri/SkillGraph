from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    EXPERIENCE_LEVELS = [
        ('Beginner', 'Beginner (0-1 yrs)'),
        ('Intermediate', 'Intermediate (1-3 yrs)'),
        ('Advanced', 'Advanced (3-5 yrs)'),
        ('Lead', 'Lead / Principal (5+ yrs)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    headline = models.CharField(max_length=255, blank=True, default='Aspiring Software Engineer')
    bio = models.TextField(blank=True, default='')
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    education_degree = models.CharField(max_length=200, blank=True, default='B.S. Computer Science')
    education_institution = models.CharField(max_length=200, blank=True, default='University')
    career_interests = models.CharField(max_length=500, blank=True, default='Full-Stack Development, AI Engineering, Cloud Systems')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVELS, default='Beginner')
    target_career = models.ForeignKey(
        'careers.CareerRole',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='aspiring_users'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} Profile ({self.experience_level})"

@receiver(post_save, sender=User)
def create_or_save_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
