
from indico_purr.services.export_revision_file import ABCExportRevisionFile
from indico_purr.controllers.utils import get_cookies_util, get_settings_util

from indico_purr.models.settings import PurrSettingsModel
from indico_purr.utils import json_encode

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase


from flask import g, request, session, make_response


class RH_revision_check_pdf_json(RHManageEventBase, ABCExportRevisionFile):
    """Return the list of editables of the event for a given type."""

    def _process(self):

        contrib_id = request.view_args['contrib_id']
        file_type = request.view_args['type']
        revision_id = request.view_args['revision_id']

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = PurrSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            if connected:

                settings = PurrSettingsModel.query.filter_by(
                    event_id=self.event.id).first()

                return json_encode({
                    'contributions': self._build_event_files_api_data(
                        self.event, contrib_id, file_type, revision_id),
                    'cookies': get_cookies_util(request.cookies),
                    'settings': get_settings_util(settings)
                })

        return make_response('', 403)
