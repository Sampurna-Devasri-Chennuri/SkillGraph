from django.db import models
from django.utils.text import slugify
from skills.models import Skill

class CareerRole(models.Model):
    DEMAND_LEVELS = [
        ('Moderate', 'Moderate Demand'),
        ('High', 'High Demand'),
        ('Very High', 'Very High Demand'),
        ('Explosive', 'Explosive Growth'),
    ]

    title = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    category = models.CharField(max_length=100, default='Software Engineering')
    short_description = models.TextField(help_text="Concise 1-2 sentence summary")
    detailed_description = models.TextField(help_text="Detailed overview of responsibilities and scope")
    salary_range_usd = models.CharField(max_length=100, default="$95,000 - $150,000")
    market_demand = models.CharField(max_length=30, choices=DEMAND_LEVELS, default='Very High')
    icon_name = models.CharField(max_length=50, default='Briefcase')
    progression_opportunities = models.JSONField(
        default=list,
        help_text="List of career progression stages, e.g. ['Junior', 'Mid', 'Senior', 'Tech Lead', 'Director']"
    )
    example_projects = models.JSONField(
        default=list,
        help_text="Curated reference projects showcasing mastery in this career"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class CareerRequiredSkill(models.Model):
    PROFICIENCY_LEVELS = [
        (1, 'Familiar'),
        (2, 'Practiced'),
        (3, 'Demonstrated / Proficient'),
        (4, 'Mastered'),
    ]

    career_role = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='required_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='career_requirements')
    is_core = models.BooleanField(default=True, help_text="True if mandatory core skill, False if recommended complementary skill")
    minimum_proficiency = models.IntegerField(choices=PROFICIENCY_LEVELS, default=2)
    weight = models.FloatField(default=1.0, help_text="Weight for gap scoring and competency calculations (1.0 - 5.0)")
    importance_reason = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ('career_role', 'skill')
        ordering = ['-is_core', '-weight']

    def __str__(self):
        core_str = "Core" if self.is_core else "Recommended"
        return f"{self.career_role.title} -> {self.skill.name} ({core_str}, Min Lvl: {self.minimum_proficiency})"
