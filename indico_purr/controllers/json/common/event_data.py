from flask import jsonify, request
from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.controllers.utils import get_cookies_util, get_settings_util
from indico_purr.services.abstract_booklet_exporter import PurrAbstractBookletExporter
from indico_purr.utils import get_purr_settings


class RHPurrSettingsAndEventDataJson(RHManageEventBase, PurrAbstractBookletExporter):
    def _process(self):
        settings = get_purr_settings(self.event)
        if not settings["connected"]:
            raise BadRequest

        return jsonify(
            {
                "event": self._export_event_data(self.event),
                "cookies": get_cookies_util(request.cookies),
                "settings": get_settings_util(self.event, settings),
            }
        )
