from indico.web.flask.util import url_for
from indico.core.config import config
from flask import current_app


def get_cookies_util(cookies):
    cookie_name = current_app.session_cookie_name
    return (
        {"indico_session_http": cookies.get(cookie_name)}
        if cookies and cookie_name in cookies
        else None
    )


def get_contribution_fields(event, settings):
    return [
        dict(id=field.id, name=field.title)
        for field in event.contribution_fields
        if field.id in settings["custom_fields"]
    ]


def get_settings_util(event, settings):
    return (
        {
            **settings,
            "timezone": str(config.DEFAULT_TIMEZONE),
            "contribution_fields": [{
                "id": f.id,
                "title": f.title,
            } for f in event.contribution_fields],
            "custom_fields": get_contribution_fields(event, settings),
            "abstract_booklet_contributions_data": url_for(
                "plugin_purr.abstract_booklet_contributions_data",
                event_id=event.id,
                session_block_id="__session_block_id__",
                _external=True,
            ),
            "abstract_booklet_sessions_data": url_for(
                "plugin_purr.abstract_booklet_sessions_data",
                event_id=event.id,
                _external=True,
            ),
            "final_proceedings_contributions_data": url_for(
                "plugin_purr.final_proceedings_contributions_data",
                event_id=event.id,
                session_block_id="__session_block_id__",
                _external=True,
            ),
            "final_proceedings_attachments_data": url_for(
                "plugin_purr.final_proceedings_attachments_data",
                event_id=event.id,
                _external=True,
            ),
            "final_proceedings_sessions_data": url_for(
                "plugin_purr.final_proceedings_sessions_data",
                event_id=event.id,
                _external=True,
            ),
        }
        if settings
        else None
    )
