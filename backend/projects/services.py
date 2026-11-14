import re
from typing import List, Dict, Any, Tuple
from skills.models import Skill
from projects.models import Project, ProjectSkillEvidence
from analytics.models import UserActivity

class ProjectSkillExtractor:
    """
    NLP-driven skill extraction engine that analyzes project descriptions,
    commit narratives, and technology stacks to extract demonstrated skills
    and quantify evidence strength.
    """

    ACTION_VERBS = {
        'high': ['engineered', 'architected', 'optimized', 'designed', 'deployed', 'scaled', 'refactored', 'fine-tuned'],
        'medium': ['implemented', 'built', 'integrated', 'developed', 'created', 'configured', 'tested'],
        'basic': ['used', 'explored', 'learned', 'studied', 'familiarized']
    }

    def __init__(self, project: Project):
        self.project = project

    def extract_and_map_skills(self) -> List[Dict[str, Any]]:
        """
        Analyzes the project content, identifies matching skills,
        computes evidence strength, and persists ProjectSkillEvidence.
        """
        all_skills = Skill.objects.select_related('category').all()
        matched_results = []

        full_text = f"{self.project.title} {self.project.description}".lower()
        tech_list = [str(t).lower().strip() for t in self.project.technologies]

        for skill in all_skills:
            score, snippet = self._evaluate_skill_evidence(skill, full_text, tech_list)
            if score > 0:
                evidence_obj, created = ProjectSkillEvidence.objects.update_or_create(
                    project=self.project,
                    skill=skill,
                    defaults={
                        'evidence_snippet': snippet,
                        'strength_rating': score,
                        'verified_by_nlp': True
                    }
                )
                matched_results.append({
                    'skill_id': skill.id,
                    'name': skill.name,
                    'category': skill.category.name,
                    'strength_rating': score,
                    'evidence_snippet': snippet,
                    'created': created
                })

        # Log activity
        UserActivity.objects.create(
            user=self.project.user,
            action_type='PROJECT_ADDED',
            description=f"Mapped {len(matched_results)} demonstrated skills to project '{self.project.title}'.",
            metadata={'project_id': self.project.id, 'skills_mapped': len(matched_results)}
        )

        return matched_results

    def _evaluate_skill_evidence(self, skill: Skill, full_text: str, tech_list: List[str]) -> Tuple[int, str]:
        """
        Calculates an evidence confidence rating (1 to 5) and generates an explanatory snippet.
        """
        skill_name_lower = skill.name.lower()
        skill_slug_lower = skill.slug.replace('-', ' ')
        tags = [t.strip().lower() for t in skill.tags.split(',') if t.strip()]

        in_tech_stack = any(
            t == skill_name_lower or t in skill_name_lower or any(t == tag for tag in tags)
            for t in tech_list
        )

        # Count occurrences in description
        pattern = re.compile(r'\b(' + '|'.join([re.escape(skill_name_lower)] + [re.escape(t) for t in tags[:4]]) + r')\b', re.IGNORECASE)
        matches = list(pattern.finditer(full_text))
        mention_count = len(matches)

        if not in_tech_stack and mention_count == 0:
            return 0, ""

        score = 1
        reasons = []

        if in_tech_stack:
            score += 2
            reasons.append("Listed in declared project technology stack")

        if mention_count >= 3:
            score += 2
            reasons.append(f"Substantially detailed across project description ({mention_count} references)")
        elif mention_count >= 1:
            score += 1
            reasons.append(f"Referenced in technical description ({mention_count} occurrence)")

        # Inspect surrounding action verbs in sentences
        sentences = re.split(r'[.!?\n]', full_text)
        verb_bonus = 0
        for sent in sentences:
            if pattern.search(sent):
                if any(v in sent for v in self.ACTION_VERBS['high']):
                    verb_bonus = max(verb_bonus, 2)
                    reasons.append("High-impact engineering actions demonstrated (architected / engineered / scaled)")
                elif any(v in sent for v in self.ACTION_VERBS['medium']):
                    verb_bonus = max(verb_bonus, 1)
                    reasons.append("Active implementation verbs evidenced (implemented / developed)")

        score = min(5, score + verb_bonus)
        snippet = "; ".join(reasons) if reasons else "Demonstrated in project artifacts."

        return score, snippet
