from flask import jsonify, request
from flask_pluginengine import current_plugin

from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.utils import get_purr_settings


class RHPurrSettingsDataJson(RHManageEventBase):
    def _process(self):
        settings = get_purr_settings(self.event)
        if not settings["connected"]:
            raise BadRequest
        
        current_plugin.logger.info(settings)

        current_plugin.logger.info(request.method)
        

        if request.method == "POST":
            current_plugin.logger.info(request.json)
            settings = request.json.settings

        return jsonify(
            {
                "method": request.method,
                "settings": settings,
            }
        )
