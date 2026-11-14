from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import UserProfile
from careers.models import CareerRole

class UserProfileSerializer(serializers.ModelSerializer):
    target_career_title = serializers.CharField(source='target_career.title', read_only=True)
    target_career_slug = serializers.CharField(source='target_career.slug', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'headline', 'bio', 'avatar_url', 'education_degree',
            'education_institution', 'career_interests', 'experience_level',
            'target_career', 'target_career_title', 'target_career_slug',
            'created_at', 'updated_at'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    target_career = serializers.PrimaryKeyRelatedField(
        queryset=CareerRole.objects.all(),
        required=False,
        allow_null=True
    )
    experience_level = serializers.ChoiceField(
        choices=UserProfile.EXPERIENCE_LEVELS,
        default='Beginner'
    )
    education_degree = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'target_career', 'experience_level', 'education_degree']

    def create(self, validated_data):
        target_career = validated_data.pop('target_career', None)
        exp_lvl = validated_data.pop('experience_level', 'Beginner')
        edu = validated_data.pop('education_degree', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )

        profile = user.profile
        profile.experience_level = exp_lvl
        if target_career:
            profile.target_career = target_career
        if edu:
            profile.education_degree = edu
        profile.save()

        return user
