

from datetime import datetime
from operator import attrgetter

from indico_jpsp_ab.forms import JpspDisconnectForm, JpspConnectForm
from indico_jpsp_ab.logger import logger

from indico_jpsp_ab.models.settings import JpspSettingsModel

from indico_jpsp_ab.services.export_event import ABCExportEvent
from indico_jpsp_ab.services.export_event_files import ABCExportEventFiles
from indico_jpsp_ab.utils import json_encode

from indico.core.cache import make_scoped_cache
from indico.core.config import config
from indico.core.db import db

from indico.modules.logs import EventLogRealm, LogKind

from flask import flash, g, has_request_context, jsonify, render_template, request, session

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.events.editing.controllers.base import RHEditableTypeEditorBase
from indico.modules.events.contributions.models.fields import ContributionField
from indico.modules.events.management.views import WPEventManagement
from indico.modules.events.contributions import contribution_settings, get_contrib_field_types
from indico.modules.events.editing.schemas import EditingEditableListSchema

from indico.web.util import jsonify_data, jsonify_template, url_for_index

from flask import g, request, session, make_response, flash

from indico.web.flask.util import url_for


class RH_get_event_files_json(RHManageEventBase, ABCExportEventFiles):
    """Return the list of editables of the event for a given type."""

    # def _process_args(self):
    #     RHEditableTypeEditorBase._process_args(self)
    #
    #     # self.contributions = (Contribution.query
    #     #                       .with_parent(self.event)
    #     #                       .options(joinedload('editables'))
    #     #                       .order_by(Contribution.friendly_id)
    #     #                       .all())

    def _process(self):

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):
            return json_encode(self._build_event_files_api_data(self.event))

        return make_response('', 403)


class RH_get_event_json(RHManageEventBase, ABCExportEvent):
    """ """

    def _process(self):

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            start_date = datetime.now().timestamp()

            res = json_encode(self._build_event_api_data(self.event))

            logger.error(f'delta: {(datetime.now().timestamp() - start_date)}')

            return res

        return make_response('', 403)


class RH_jpsp_home_page(RHManageEventBase):
    """ """

    def _process(self):

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()
            
            settings = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).first()

            return WPEventManagement.render_template('jpsp_ab:home.html', self.event, 
                                                     connected=connected, settings=settings)

        return make_response('', 403)


class RH_jpsp_connect_page(RHManageEventBase):
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


class RH_jpsp_disconnect_page(RHManageEventBase):
    """ """

    def _process_GET(self):
        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            form = JpspDisconnectForm(connected=connected)

            return jsonify_template('jpsp_ab:disconnect.html',
                                    event=self.event, form=form)

        return make_response('', 403)

    def _process_POST(self):
        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()
            
            if connected:

                settings = JpspSettingsModel.query.filter_by(
                    event_id=self.event.id).first()
                
                db.session.delete(settings)
                db.session.commit()
                db.session.flush()

                self.event.log(EventLogRealm.management, LogKind.positive, 'JPSP-NG',
                                f'Settings removed', session.user)

            return jsonify_data(flash=True)

        return make_response('', 403)
