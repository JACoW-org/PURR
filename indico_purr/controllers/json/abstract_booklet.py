
from indico_purr.controllers.utils import get_cookies_util, get_settings_util

from indico_purr.models.settings import PurrSettingsModel
from indico_purr.services.abstract_booklet_exporter import AbstractBookletExporter

from indico_purr.utils import json_encode

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from flask_pluginengine import current_plugin

from flask import g, request, session, make_response


class RH_abstract_booklet_json(RHManageEventBase, AbstractBookletExporter):
    """ """

    def _process(self):

        event_id = request.view_args.get('event_id')

        self.user = g.current_api_user = session.user
        self.event = Event.get(event_id)

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
    