from indico.modules.events.management.controllers.base import RHManageEventBase
from indico.modules.events.management.views import WPEventManagement

from indico_purr.controllers.utils import get_settings_util
from indico_purr.utils import get_purr_settings


class RHPurrHomePage(RHManageEventBase):
    def _process(self):
        settings = get_purr_settings(self.event)
        return WPEventManagement.render_template('purr:home.html',
                                                 self.event,
                                                 connected=settings['connected'],
                                                 settings=get_settings_util(self.event, settings))
