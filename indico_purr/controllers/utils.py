from indico.core.config import config
from flask import current_app


def get_cookies_util(cookies):
    cookie_name = current_app.session_cookie_name
    return {
        'indico_session_http': cookies.get(cookie_name)
    } if cookies and cookie_name in cookies else None


def get_contribution_fields(event, settings):
    return [
        dict(id=field.id, name=field.title)
        for field in event.contribution_fields
        if field.id in settings['custom_fields']
    ]


def get_settings_util(event, settings):
    return {
        **settings,
        'timezone': str(config.DEFAULT_TIMEZONE),
        'custom_fields': get_contribution_fields(event, settings)
    } if settings else None
