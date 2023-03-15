




from indico_purr.forms import PurrSettingsForm

from indico_purr.models.settings import PurrSettingsModel


from indico.core.db import db

from indico.modules.logs import EventLogRealm, LogKind

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from indico.web.util import jsonify_data, jsonify_template

from flask import session, make_response




class RH_disconnect_page(RHManageEventBase):
    """ """

    def _process_GET(self):

        if self.event.can_manage(session.user):

            connected = PurrSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            form = PurrSettingsForm(connected=connected)

            return jsonify_template('purr:disconnect.html',
                                    event=self.event, form=form)

        return make_response('', 403)

    def _process_POST(self):

        if self.event.can_manage(session.user):

            connected = PurrSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            if connected:

                settings = PurrSettingsModel.query.filter_by(
                    event_id=self.event.id).first()

                db.session.delete(settings)
                db.session.commit()
                db.session.flush()

                self.event.log(EventLogRealm.management, LogKind.positive, 
                               'PURR', 'Settings removed', session.user)

            return jsonify_data(flash=True)

        return make_response('', 403)
