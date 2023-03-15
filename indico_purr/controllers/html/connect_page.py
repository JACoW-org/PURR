
from indico_purr.forms import PurrConnectForm

from indico_purr.models.settings import PurrSettingsModel


from indico.core.db import db

from indico.modules.logs import EventLogRealm, LogKind

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from indico.web.util import jsonify_data, jsonify_template

from flask import request, session, make_response


class RH_connect_page(RHManageEventBase):
    """ """

    def _process_GET(self):

        if self.event.can_manage(session.user):

            connected = PurrSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            if connected:
                settings = PurrSettingsModel.query.filter_by(
                    event_id=self.event.id).first()

                form = PurrConnectForm(api_url=settings.api_url,
                                       api_key=settings.api_key)
            else:
                form = PurrConnectForm()

            return jsonify_template('purr:connect.html',
                                    event=self.event, form=form)

        return make_response('', 403)

    def _process_POST(self):

        if self.event.can_manage(session.user):

            form = PurrConnectForm(api_url=request.form['api_url'],
                                   api_key=request.form['api_key'])

            if form.validate_on_submit():

                settings = PurrSettingsModel()
                settings.populate_from_dict(form.data)

                settings.user_id = session.user.id
                settings.event_id = self.event.id

                db.session.add(settings)
                db.session.commit()
                db.session.flush()

                self.event.log(EventLogRealm.management, LogKind.positive,
                               'PURR', 'Settings saved', session.user)

                return jsonify_data(flash=True)

            return jsonify_template('purr:connect.html',
                                    event=self.event, form=form)

        return make_response('', 403)
