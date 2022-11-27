



from indico_jpsp_ab.services.export_revision_file import ABCExportRevisionFile

from indico_jpsp_ab.controllers.utils import get_cookies_util, get_settings_util

from indico_jpsp_ab.models.settings import JpspSettingsModel

from indico_jpsp_ab.utils import json_encode



from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase


from flask import g, request, session, make_response





class RH_revision_check_pdf_json(RHManageEventBase, ABCExportRevisionFile):
    """Return the list of editables of the event for a given type."""

    def _process(self):

        # print(session)
        # print(request.headers)
        # print(request.cookies)
        # print(session.user)

        contrib_id = request.view_args['contrib_id']
        type = request.view_args['type']
        revision_id = request.view_args['revision_id']

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):
            
            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()
            
            if connected:

                settings = JpspSettingsModel.query.filter_by(
                    event_id=self.event.id).first()
                
                return json_encode({
                    'contributions': self._build_event_files_api_data(self.event, contrib_id, type, revision_id),
                    'cookies': get_cookies_util(request.cookies),
                    'settings': get_settings_util(settings)
                })

        return make_response('', 403)
    

