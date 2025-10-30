from flask import session

from indico.core import signals
from indico.core.plugins import IndicoPlugin, url_for_plugin
from indico.modules.events.management.views import WPEventManagement
from indico.web.menu import SideMenuItem

from indico_purr import _
from indico_purr.blueprint import blueprint
from indico_purr.settings import DEFAULT_SETTINGS


class PurrPlugin(IndicoPlugin):
    """CAT"""

    configurable = False
    default_event_settings = DEFAULT_SETTINGS

    def init(self):
        super(PurrPlugin, self).init()
        self.register_assets()
        self.connect(signals.menu.items, self.purr_sidemenu_items,
                     sender='event-management-sidemenu')

    def purr_sidemenu_items(self, sender, event, **kwargs):
        if event.can_manage(session.user):
            yield SideMenuItem('purr', _('CAT'),
                               url_for_plugin('purr.purr_home', event),
                               0, section='workflows', icon='pdf')

    def get_blueprints(self):
        return blueprint

    def register_assets(self):
        self.inject_bundle('script.js', WPEventManagement)
        self.inject_bundle('style.css', WPEventManagement)
