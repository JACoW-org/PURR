from flask import jsonify, request, session
from flask_pluginengine import current_plugin

from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.utils import get_purr_settings, set_purr_settings
from indico_purr.models.settings import PurrSettings

from indico.modules.logs import EventLogRealm, LogKind

class RHPurrSettingsDataJson(RHManageEventBase):
    CSRF_ENABLED = False

    def _process(self):
        settings = get_purr_settings(self.event)

        current_plugin.logger.info(settings)
        current_plugin.logger.info(request.method)

        if request.method == "POST":
            current_plugin.logger.info(request.json)

            settings_dict: dict = request.json.get("settings")
            purr_settings = PurrSettings(
                ab_session_h1 = settings_dict.get('ab_session_h1'),
                ab_session_h2 = settings_dict.get('ab_session_h2'),
                ab_contribution_h1 = settings_dict.get('ab_contribution_h1'),
                ab_contribution_h2 = settings_dict.get('ab_contribution_h2'),
                isbn = settings_dict.get('isbn'),
                issn = settings_dict.get('issn'),
                booktitle_short = settings_dict.get('booktitle_short'),
                booktitle_long = settings_dict.get('booktitle_long'),
                series = settings_dict.get('series'),
                series_number = settings_dict.get('series_number'),
                location = settings_dict.get('location'),
                host_info = settings_dict.get('host_info'),
                editorial_board = settings_dict.get('editorial_board'),
                doi_base_url = settings_dict.get('doi_base_url'),
                doi_user = settings_dict.get('doi_user'),
                doi_password = settings_dict.get('doi_password'),
            )

            errors = purr_settings.validate()
            if errors:
                return jsonify({
                    "method": request.method,
                    "is_valid": False,
                    "errors": errors
                })

            set_purr_settings(self.event, **purr_settings.as_dict())

            self.event.log(
                EventLogRealm.management,
                LogKind.change,
                "PURR",
                "Updated",
                session.user,
            )

            return jsonify(
                {
                    "method": request.method,
                    "settings": get_purr_settings(self.event),
                    "is_valid": True,
                    "errors": errors
                }
            )

        return jsonify(
            {
                "method": request.method,
                "settings": settings,
            }
        )
