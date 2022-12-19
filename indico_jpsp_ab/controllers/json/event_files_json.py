
from indico_jpsp_ab.controllers.utils import get_cookies_util, get_settings_util

from indico_jpsp_ab.models.settings import JpspSettingsModel

from indico_jpsp_ab.services.export_event_files import ABCExportEventFiles
from indico_jpsp_ab.utils import json_encode



from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase


from flask import g, request, session, make_response, flash




class RH_event_files_json(RHManageEventBase, ABCExportEventFiles):
    """Return the list of editables of the event for a given type."""

    def _process(self):

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):
            
            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()
            
            if connected:

                settings = JpspSettingsModel.query.filter_by(
                    event_id=self.event.id).first()
                
                return json_encode({
                    'contributions': self._build_event_files_api_data(self.event),
                    'cookies': get_cookies_util(request.cookies),
                    'settings': get_settings_util(settings)
                })

        return make_response('', 403)