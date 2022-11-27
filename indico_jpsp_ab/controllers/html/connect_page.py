
from indico_jpsp_ab.forms import JpspConnectForm

from indico_jpsp_ab.models.settings import JpspSettingsModel


from indico.core.db import db

from indico.modules.logs import EventLogRealm, LogKind

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from indico.web.util import jsonify_data, jsonify_template

from flask import g, request, session, make_response






class RH_connect_page(RHManageEventBase):
    """ """

    def _process_GET(self):
        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            if connected:
                settings = JpspSettingsModel.query.filter_by(
                    event_id=self.event.id).first()
                form = JpspConnectForm(api_url=settings.api_url,
                                       api_key=settings.api_key)
            else:
                form = JpspConnectForm()

            return jsonify_template('jpsp_ab:connect.html',
                                    event=self.event, form=form)

        return make_response('', 403)

    def _process_POST(self):
        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            form = JpspConnectForm(api_url=request.form['api_url'],
                                   api_key=request.form['api_key'])

            if form.validate_on_submit():

                settings = JpspSettingsModel()
                settings.populate_from_dict(form.data)

                settings.user_id = self.user.id
                settings.event_id = self.event.id

                db.session.add(settings)
                db.session.commit()
                db.session.flush()

                self.event.log(EventLogRealm.management, LogKind.positive, 'JPSP-NG',
                               f'Settings saved', session.user)

                return jsonify_data(flash=True)

            return jsonify_template('jpsp_ab:connect.html',
                                    event=self.event, form=form)

        return make_response('', 403)
