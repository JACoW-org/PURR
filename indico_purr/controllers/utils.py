from indico.core.config import config


def get_cookies_util(c):
    # XXX you probably want `current_app.config['SESSION_COOKIE_NAME']` here since `indico_session_http`
    # is not a cookie name indico ever uses (it's just `indico_session`)
    return {
        'indico_session_http': c.get('indico_session_http')
    } if c else None


def get_contribution_fields(event, s) -> list:
    return [
        dict(id=f.id, name=f.title)
        for f in event.contribution_fields
        if f.id in s['custom_fields']
    ]


def get_settings_util(event, settings):
    if not settings:
        return None
    # XXX i was too lazy to clean this up. you can probably get rid of this and just copy
    # `settings` and add timezone and update custom fields
    return dict(
        api_key=settings['api_key'],
        api_url=settings['api_url'],
        timezone=str(config.DEFAULT_TIMEZONE),
        pdf_page_width=settings['pdf_page_width'],
        pdf_page_height=settings['pdf_page_height'],
        custom_fields=get_contribution_fields(event, settings),
        ab_session_h1=settings['ab_session_h1'],
        ab_session_h2=settings['ab_session_h2'],
        ab_contribution_h1=settings['ab_contribution_h1'],
        ab_contribution_h2=settings['ab_contribution_h2']
    )
