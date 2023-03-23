from flask import make_response, request, session

from indico.modules.events.management.controllers.base import RHManageEventBase

from indico_purr.controllers.utils import get_cookies_util, get_settings_util
from indico_purr.models.settings import PurrSettingsModel
from indico_purr.services.final_proceedings_exporter import PurrFinalProceedingsExporter
from indico_purr.utils import json_encode


class RHPurrFinalProceedingsJson(RHManageEventBase, PurrFinalProceedingsExporter):
    """ """

    def _process(self):

        if self.event.can_manage(session.user):

            connected = PurrSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            if connected:

                settings = PurrSettingsModel.query.filter_by(
                    event_id=self.event.id).first()

                return json_encode({
                    'event': self._build_event_api_data(self.event),
                    'cookies': get_cookies_util(request.cookies),
                    'settings': get_settings_util(settings)
                })

        return make_response('', 403)
