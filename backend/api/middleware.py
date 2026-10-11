from django.utils import translation

SUPPORTED_LOCALES = {'ar', 'fa', 'en'}


class ReadLocaleMiddleware:
    """Activate the requested locale for safe (read) requests.

    Lets django-modeltranslation serve `title` / `description` / `name` etc.
    in the caller's language. Writes are left untouched so the admin's explicit
    `*_ar` / `*_fa` / `*_en` values land in the correct columns.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            raw = request.GET.get('lang') or request.headers.get('Accept-Language', '')
            code = raw.split(',')[0].strip().split('-')[0].lower()
            if code in SUPPORTED_LOCALES:
                translation.activate(code)
        try:
            return self.get_response(request)
        finally:
            translation.deactivate()
