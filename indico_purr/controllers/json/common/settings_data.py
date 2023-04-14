from flask import jsonify, request, session
from flask_pluginengine import current_plugin
from indico.web.forms.base import FormDefaults

from indico_purr.forms import PurrSettingsForm
from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.utils import get_purr_settings, set_purr_settings

from indico.modules.logs import EventLogRealm, LogKind


class RHPurrSettingsDataJson(RHManageEventBase):
    CSRF_ENABLED = False

    def _process(self):
        settings = get_purr_settings(self.event)

        current_plugin.logger.info(settings)
        current_plugin.logger.info(request.method)

        if request.method == "POST":
            current_plugin.logger.info(request.json)

            data = FormDefaults({**settings, **request.json.get("settings")})
            form = PurrSettingsForm(event=self.event, obj=data)

            current_plugin.logger.info(form.data)
            current_plugin.logger.info(form.validate())

            if form.validate():
                set_purr_settings(self.event, **form.data)
                
                self.event.log(
                    EventLogRealm.management,
                    LogKind.change,
                    "PURR",
                    "Updated",
                    session.user,
                )
                
                settings = get_purr_settings(self.event)

        return jsonify(
            {
                "method": request.method,
                "settings": settings,
            }
        )
