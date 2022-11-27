



def get_cookies_util(c) -> dict | None:
    return {
        'indico_session_http': c.get('indico_session_http')
    } if c else None


def get_settings_util(s) -> dict | None:
    return {
        'api_key': s.api_key,
        'api_url': s.api_url,
    } if s else None
    