from flask import session

from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.logs import EventLogRealm, LogKind
from indico.web.forms.base import FormDefaults
from indico.web.util import jsonify_data, jsonify_form

from indico_purr.utils import get_purr_settings, set_purr_settings


class RHPurrSettingsPage(RHManageEventBase):
    def _process(self):
        return jsonify_data()
        # settings = get_purr_settings(self.event)
        # form = PurrSettingsForm(event=self.event, obj=FormDefaults(**settings))
        # if form.validate_on_submit():
        #     set_purr_settings(self.event, **form.data)
        #     self.event.log(EventLogRealm.management, LogKind.change, 'PURR', 'Updated', session.user)
        #     return jsonify_data()
        # return jsonify_form(form)
