from flask import jsonify, request
from werkzeug.exceptions import BadRequest

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.controllers.utils import get_cookies_util, get_settings_util
from indico_purr.services.final_proceedings_exporter import PurrFinalProceedingsExporter
from indico_purr.utils import get_purr_settings


class RHPurrFinalProceedingsJson(RHManageEventBase, PurrFinalProceedingsExporter):
    def _process(self):
        settings = get_purr_settings(self.event)
        if not settings['connected']:
            raise BadRequest

        return jsonify({
            'event': self._build_event_api_data(self.event),
            'cookies': get_cookies_util(request.cookies),
            'settings': get_settings_util(self.event, settings)
        })
