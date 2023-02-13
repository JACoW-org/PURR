
from indico_purr.controllers.utils import get_cookies_util, get_settings_util

from indico_purr.models.settings import PurrSettingsModel

from indico_purr.services.export_event import ABCExportEvent
from indico_purr.utils import json_encode


from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase


from flask import g, request, session, make_response


class RH_event_json(RHManageEventBase, ABCExportEvent):
    """ """

    def _process(self):

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):
            
            connected = PurrSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()
            
            if connected:

                settings = PurrSettingsModel.query.filter_by(
                    event_id=self.event.id).first()
                
                return json_encode({
                    'event': self._build_event_api_data(self.event,
                                                        sessions=True,
                                                        contributions=False,
                                                        occurrences=False),
                    'cookies': get_cookies_util(request.cookies),
                    'settings': get_settings_util(settings)
                })

        return make_response('', 403)
    