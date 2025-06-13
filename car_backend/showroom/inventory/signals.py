from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import UserProfile

# ❌ DO NOT automatically create UserProfile anymore
# Creation is now handled manually in RegisterView

# ✅ Save UserProfile only if it exists (optional but safe to keep)
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    try:
        if hasattr(instance, 'userprofile'):
            instance.userprofile.save()
    except UserProfile.DoesNotExist:
        pass  # Profile might not yet be created; ignore
