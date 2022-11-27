




from indico_jpsp_ab.forms import JpspSettingsForm

from indico_jpsp_ab.models.settings import JpspSettingsModel

from indico_jpsp_ab.utils import json_decode, json_encode

from indico.core.db import db

from indico.modules.logs import EventLogRealm, LogKind

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase

from indico.web.util import jsonify_data, jsonify_template

from flask import g, request, session, make_response









class RH_settings_page(RHManageEventBase):
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

                custom_fields = json_decode(settings.custom_fields.encode(
                    'utf-8')) if settings.custom_fields else []

                form = JpspSettingsForm(pdf_page_width=settings.pdf_page_width,
                                        pdf_page_height=settings.pdf_page_height)

                return jsonify_template('jpsp_ab:settings.html', form=form,
                                        event=self.event, custom_fields=custom_fields)

        return make_response('', 403)

    def _process_POST(self):
        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            if connected:

                form = JpspSettingsForm(pdf_page_width=request.form['pdf_page_width'],
                                        pdf_page_height=request.form['pdf_page_height'])

                settings = JpspSettingsModel.query.filter_by(
                    event_id=self.event.id).first()

                if form.validate_on_submit():

                    settings.populate_from_dict(form.data)
                    settings.custom_fields = str(json_encode([
                        int(request.form[key])
                        for key in request.form
                        if key.startswith('custom_field_')
                    ]), 'utf-8')

                    db.session.add(settings)
                    db.session.commit()
                    db.session.flush()

                    print(settings)

                    self.event.log(EventLogRealm.management, LogKind.positive, 'JPSP-NG',
                                   f'Settings saved', session.user)

                    return jsonify_data(flash=True)

                return jsonify_template('jpsp_ab:settings.html', custom_fields=[],
                                        event=self.event, form=form)

        return make_response('', 403)