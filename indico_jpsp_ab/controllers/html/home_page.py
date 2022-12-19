




from indico_jpsp_ab.controllers.utils import get_settings_util
from indico_jpsp_ab.models.settings import JpspSettingsModel

from indico.modules.events import Event
from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.events.management.views import WPEventManagement


from flask import g, request, session, make_response





class RH_home_page(RHManageEventBase):
    """ """

    def _process(self):

        self.user = g.current_api_user = session.user
        self.event = Event.get(request.view_args['event_id'])

        if self.event.can_manage(session.user):

            connected = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).has_rows()

            settings = JpspSettingsModel.query.filter_by(
                event_id=self.event.id).first()

            return WPEventManagement.render_template('jpsp_ab:home.html',
                                                     self.event,
                                                     connected=connected,
                                                     settings=get_settings_util(settings))

        return make_response('', 403)