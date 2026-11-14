from django.test import TestCase
from django.contrib.auth.models import User
from skills.models import SkillCategory, Skill, SkillDependency, UserSkill
from careers.models import CareerRole, CareerRequiredSkill
from graph_engine.services import SkillGraphEngine
from graph_engine.gap_analyzer import SkillGapAnalyzer
from learning_paths.services import LearningPathGenerator
from careers.simulator import CareerSimulator
from projects.models import Project
from projects.services import ProjectSkillExtractor

class GraphEngineTestCase(TestCase):
    def setUp(self):
        self.cat = SkillCategory.objects.create(name='Test Category', slug='test-cat')
        self.s1 = Skill.objects.create(name='Python', slug='python', category=self.cat, difficulty_level='Beginner', importance_weight=2.0)
        self.s2 = Skill.objects.create(name='NumPy', slug='numpy', category=self.cat, difficulty_level='Beginner', importance_weight=1.5)
        self.s3 = Skill.objects.create(name='Deep Learning', slug='deep-learning', category=self.cat, difficulty_level='Advanced', importance_weight=3.0)

        # Dependencies: Python -> NumPy -> Deep Learning
        SkillDependency.objects.create(source_skill=self.s1, target_skill=self.s2, dependency_type='STRICT_PREREQUISITE')
        SkillDependency.objects.create(source_skill=self.s2, target_skill=self.s3, dependency_type='STRICT_PREREQUISITE')

        self.user = User.objects.create_user(username='tester', password='PassWord123!')
        self.career = CareerRole.objects.create(
            title='AI Specialist',
            slug='ai-specialist',
            category='AI',
            short_description='Tests AI systems'
        )
        CareerRequiredSkill.objects.create(career_role=self.career, skill=self.s3, is_core=True, minimum_proficiency=3, weight=3.0)

    def test_dag_property_and_transitive_prerequisites(self):
        engine = SkillGraphEngine()
        self.assertTrue(engine.is_dag())
        prereqs = engine.get_all_prerequisites(self.s3.id)
        self.assertEqual(prereqs, {self.s1.id, self.s2.id})

    def test_topological_sort_learning_path(self):
        generator = LearningPathGenerator(self.user, self.career)
        path = generator.generate_roadmap()
        steps = list(path.steps.all().order_by('sequence_order'))

        # Verify prerequisite ordering: Python must come before NumPy, NumPy before Deep Learning
        skill_order = [step.skill.slug for step in steps]
        self.assertIn('python', skill_order)
        self.assertIn('numpy', skill_order)
        self.assertIn('deep-learning', skill_order)
        self.assertLess(skill_order.index('python'), skill_order.index('numpy'))
        self.assertLess(skill_order.index('numpy'), skill_order.index('deep-learning'))

    def test_skill_gap_analysis(self):
        # User has Python demonstrated
        UserSkill.objects.create(user=self.user, skill=self.s1, proficiency_level=3, status='DEMONSTRATED')
        analyzer = SkillGapAnalyzer(self.user, self.career)
        result = analyzer.analyze()

        # Missing required skill is Deep Learning, and missing foundational prerequisite is NumPy
        self.assertEqual(len(result['missing_skills']), 1)
        self.assertEqual(result['missing_skills'][0]['name'], 'Deep Learning')
        self.assertEqual(result['summary']['core_coverage_pct'], 0.0)

    def test_project_nlp_extraction(self):
        proj = Project.objects.create(
            user=self.user,
            title='Neural Network Experiment',
            description='Engineered deep learning architectures using Python and NumPy with automated hyperparameter search.',
            technologies=['Python', 'NumPy']
        )
        extractor = ProjectSkillExtractor(proj)
        matches = extractor.extract_and_map_skills()
        matched_names = [m['name'] for m in matches]
        self.assertIn('Python', matched_names)
        self.assertIn('NumPy', matched_names)
