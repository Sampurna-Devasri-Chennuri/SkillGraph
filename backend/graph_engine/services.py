import networkx as nx
from typing import Dict, List, Set, Any, Optional
from skills.models import Skill, SkillDependency, UserSkill, LearningResource
from careers.models import CareerRole, CareerRequiredSkill
from projects.models import Project, ProjectSkillEvidence

class SkillGraphEngine:
    """
    Core graph intelligence engine built on NetworkX.
    Models technical skills as a Directed Acyclic Graph (DAG)
    where edges flow from Prerequisite -> Dependent.
    """

    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        """Constructs NetworkX DiGraph from database Skill and SkillDependency records."""
        skills = Skill.objects.select_related('category').all()
        for skill in skills:
            self.graph.add_node(
                skill.id,
                slug=skill.slug,
                name=skill.name,
                category=skill.category.name,
                category_slug=skill.category.slug,
                category_color=skill.category.color_hex,
                difficulty=skill.difficulty_level,
                weight=skill.importance_weight,
                icon=skill.icon_name,
                tags=skill.tags,
                description=skill.description
            )

        dependencies = SkillDependency.objects.select_related('source_skill', 'target_skill').all()
        for dep in dependencies:
            if self.graph.has_node(dep.source_skill_id) and self.graph.has_node(dep.target_skill_id):
                self.graph.add_edge(
                    dep.source_skill_id,
                    dep.target_skill_id,
                    type=dep.dependency_type,
                    strength=dep.strength,
                    reason=dep.reason
                )

    def is_dag(self) -> bool:
        """Verifies that the skill dependency network contains no circular loops."""
        return nx.is_directed_acyclic_graph(self.graph)

    def get_cycles(self) -> List[List[int]]:
        """Returns circular dependency cycles if any exist."""
        try:
            return list(nx.simple_cycles(self.graph))
        except Exception:
            return []

    def get_all_prerequisites(self, skill_id: int) -> Set[int]:
        """Returns all ancestral prerequisites required before this skill (transitive closure)."""
        if not self.graph.has_node(skill_id):
            return set()
        return nx.ancestors(self.graph, skill_id)

    def get_direct_prerequisites(self, skill_id: int) -> List[int]:
        """Returns immediate predecessor prerequisites."""
        if not self.graph.has_node(skill_id):
            return []
        return list(self.graph.predecessors(skill_id))

    def get_direct_dependents(self, skill_id: int) -> List[int]:
        """Returns skills that directly depend on this skill."""
        if not self.graph.has_node(skill_id):
            return []
        return list(self.graph.successors(skill_id))

    def get_all_unlocked_skills(self, skill_id: int) -> Set[int]:
        """Returns all skills downstream that this skill helps unlock."""
        if not self.graph.has_node(skill_id):
            return set()
        return nx.descendants(self.graph, skill_id)

    def get_topological_order(self, skill_ids: Optional[Set[int]] = None) -> List[int]:
        """
        Returns a topologically sorted sequence of skills.
        If a subset of skill_ids is provided, returns the valid sequence for that induced subgraph.
        """
        if skill_ids:
            # Include all ancestral dependencies of the subset to ensure valid ordering
            full_closure = set(skill_ids)
            for s_id in list(skill_ids):
                full_closure.update(self.get_all_prerequisites(s_id))
            subgraph = self.graph.subgraph(full_closure)
            try:
                return list(nx.topological_sort(subgraph))
            except nx.NetworkXUnfeasible:
                return list(full_closure)
        try:
            return list(nx.topological_sort(self.graph))
        except nx.NetworkXUnfeasible:
            return list(self.graph.nodes())

    def serialize_graph_for_visualization(
        self,
        user=None,
        career_slug: Optional[str] = None,
        category_slug: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Serializes nodes and edges into React Flow compatible format with auto-layout positions,
        user acquisition status, and career requirement highlights.
        """
        user_skills_map = {}
        if user and user.is_authenticated:
            for us in UserSkill.objects.filter(user=user).select_related('skill'):
                user_skills_map[us.skill_id] = {
                    'proficiency': us.proficiency_level,
                    'status': us.status,
                    'source': us.verification_source
                }

        career_required_map = {}
        if career_slug:
            try:
                career = CareerRole.objects.get(slug=career_slug)
                for req in CareerRequiredSkill.objects.filter(career_role=career).select_related('skill'):
                    career_required_map[req.skill_id] = {
                        'is_core': req.is_core,
                        'min_proficiency': req.minimum_proficiency,
                        'weight': req.weight
                    }
            except CareerRole.DoesNotExist:
                pass

        # Determine node filter
        visible_nodes = set(self.graph.nodes())

        if category_slug and category_slug != 'all':
            visible_nodes = {
                nid for nid in visible_nodes
                if self.graph.nodes[nid].get('category_slug') == category_slug
            }

        if career_slug and career_required_map:
            # Visible are career skills + their prerequisites
            career_nodes = set(career_required_map.keys())
            career_prereqs = set()
            for cn in career_nodes:
                career_prereqs.update(self.get_all_prerequisites(cn))
            visible_nodes = visible_nodes.intersection(career_nodes.union(career_prereqs))

        if search_query:
            query = search_query.lower().strip()
            visible_nodes = {
                nid for nid in visible_nodes
                if query in self.graph.nodes[nid].get('name', '').lower()
                or query in self.graph.nodes[nid].get('tags', '').lower()
            }

        # Subgraph for layout calculation
        sub_g = self.graph.subgraph(visible_nodes)

        # Compute layered layout coordinates based on topological levels
        try:
            topo_order = list(nx.topological_sort(sub_g))
        except Exception:
            topo_order = list(visible_nodes)

        levels = {}
        for nid in topo_order:
            preds = [p for p in sub_g.predecessors(nid) if p in levels]
            levels[nid] = max([levels[p] for p in preds], default=-1) + 1

        level_buckets: Dict[int, List[int]] = {}
        for nid, lvl in levels.items():
            level_buckets.setdefault(lvl, []).append(nid)

        nodes_list = []
        for lvl, nids in level_buckets.items():
            for idx, nid in enumerate(nids):
                data = self.graph.nodes[nid]
                u_info = user_skills_map.get(nid, None)
                c_info = career_required_map.get(nid, None)

                # Determine status tag
                status = 'UNACQUIRED'
                if u_info:
                    status = u_info['status']
                elif c_info:
                    status = 'TARGET_REQUIRED' if c_info['is_core'] else 'TARGET_RECOMMENDED'

                # Positions
                x = lvl * 280 + 60
                y = (idx - len(nids) / 2.0) * 130 + 350

                nodes_list.append({
                    'id': str(nid),
                    'type': 'skillNode',
                    'position': {'x': x, 'y': y},
                    'data': {
                        'skillId': nid,
                        'name': data.get('name'),
                        'slug': data.get('slug'),
                        'category': data.get('category'),
                        'categorySlug': data.get('category_slug'),
                        'categoryColor': data.get('category_color'),
                        'difficulty': data.get('difficulty'),
                        'weight': data.get('weight'),
                        'icon': data.get('icon'),
                        'description': data.get('description'),
                        'userProficiency': u_info['proficiency'] if u_info else 0,
                        'userStatus': status,
                        'isCareerCore': c_info['is_core'] if c_info else False,
                        'isCareerRecommended': not c_info['is_core'] if c_info else False,
                        'minProficiency': c_info['min_proficiency'] if c_info else None,
                        'prereqCount': len(list(self.graph.predecessors(nid))),
                        'dependentCount': len(list(self.graph.successors(nid))),
                    }
                })

        # Edges
        edges_list = []
        for u, v, edata in sub_g.edges(data=True):
            u_acquired = user_skills_map.get(u, {}).get('status') in ['DEMONSTRATED', 'PRACTICED']
            v_acquired = user_skills_map.get(v, {}).get('status') in ['DEMONSTRATED', 'PRACTICED']

            edge_color = '#38bdf8' if (u_acquired and v_acquired) else '#475569'
            is_active = u_acquired and not v_acquired

            edges_list.append({
                'id': f"e-{u}-{v}",
                'source': str(u),
                'target': str(v),
                'animated': is_active,
                'style': {
                    'stroke': '#a855f7' if is_active else edge_color,
                    'strokeWidth': 2 if is_active else 1.5,
                },
                'data': {
                    'type': edata.get('type'),
                    'strength': edata.get('strength'),
                    'reason': edata.get('reason'),
                }
            })

        return {
            'nodes': nodes_list,
            'edges': edges_list,
            'summary': {
                'totalNodes': len(nodes_list),
                'totalEdges': len(edges_list),
                'isDag': self.is_dag()
            }
        }
