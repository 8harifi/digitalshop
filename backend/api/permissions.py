from rest_framework.permissions import BasePermission, SAFE_METHODS


class ReadOnlyOrAdmin(BasePermission):
    """Anyone may read; only staff may write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class PublicCreateStaffRead(BasePermission):
    """Anyone may POST (public inquiry form); only staff may read/write otherwise."""

    def has_permission(self, request, view):
        if request.method == 'POST':
            return True
        return bool(request.user and request.user.is_staff)
