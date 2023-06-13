from flask import session

from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.logs import EventLogRealm, LogKind
from indico.web.util import jsonify_data

from indico_purr.utils import clear_purr_settings


class RHPurrDisconnectDataJson(RHManageEventBase):
    def _process(self):
        clear_purr_settings(self.event)
        self.event.log(EventLogRealm.management, LogKind.negative, 'PURR', 'Disconnected', session.user)
        return jsonify_data()
