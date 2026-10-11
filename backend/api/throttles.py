from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


class InquiryRateThrottle(AnonRateThrottle):
    scope = 'inquiry'
