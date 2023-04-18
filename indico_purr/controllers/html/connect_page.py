from flask import session, jsonify, request

from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.logs import EventLogRealm, LogKind
from indico.web.forms.base import FormDefaults
from indico.web.util import jsonify_data, jsonify_form
from flask_pluginengine import current_plugin

from indico_purr import _
# from indico_purr.forms import PurrConnectForm
from indico_purr.utils import get_purr_settings, set_purr_settings

from indico_purr.models.connection import PurrConnection


class RHPurrConnectPage(RHManageEventBase):
    CSRF_ENABLED = False

    def _process(self):

        current_plugin.logger.info(request.json)

        connection = PurrConnection(**request.json.get("connection"))

        errors = connection.validate()
        if errors:
            return jsonify({
                "is_valid": False,
                "errors": errors
            })

        set_purr_settings(self.event, **connection.as_dict(), connected=True)

        self.event.log(
            EventLogRealm.management,
            LogKind.change,
            "PURR",
            "Updated",
            session.user,
        )

        return jsonify(
            {
                "settings": get_purr_settings(self.event),
                "is_valid": True
            }
        )
