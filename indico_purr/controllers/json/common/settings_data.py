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

        contribution_fields = [{
            "id": f.id,
            "title": f.title,
        } for f in self.event.contribution_fields]

        if request.method == "POST":
            current_plugin.logger.info(request.json)

            purr_settings = PurrSettings(**request.json.get("settings"))

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
                    "settings": dict(**get_purr_settings(self.event),
                                     contribution_fields=contribution_fields),
                    "is_valid": True
                }
            )

        return jsonify(
            {
                "method": request.method,
                "settings": dict(**settings, contribution_fields=contribution_fields),
            }
        )
