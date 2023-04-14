from flask import session

from indico.core import signals
from indico.core.plugins import IndicoPlugin, url_for_plugin
from indico.modules.events.management.views import WPEventManagement
from indico.web.menu import SideMenuItem

from indico_purr import _
from indico_purr.blueprint import blueprint


class PurrPlugin(IndicoPlugin):
    """PURR"""

    configurable = False
    default_event_settings = {
        'connected': False,
        'api_url': '',
        'api_key': '',
        'pdf_page_width': 0.1,
        'pdf_page_height': 0.1,
        'custom_fields': [],
        'ab_session_h1': '{code} - {title}',
        'ab_session_h2': '{start} / {end}',
        'ab_contribution_h1': '| {code} | / | {start} |',
        'ab_contribution_h2': '| {code} | / | {start} |',
        'event_name': 'IPAC\'23',
        'event_title': '40th International Free Electron Laser Conference',
        'event_hosted': 'FEL2022 was hosted by Elettra-Sincrotrone Trieste, Trieste, Italy, and held at the Trieste Convention Center in Trieste, Italy 22-26 Aug 2022',
        'event_editorial': 'Peter Forck (GSI), Adriana Wawrzyniak (SOLARIS), Agnieszka Cudek (SOLARIS), Volker R.W. Schaa (GSI), Grzegorz W. Kowalski (SOLARIS)',
        'event_context': 'ipac-23',
        'event_date': 'May, 2023',
        'event_location': 'Venice, Italy',     
        'event_isbn': '978-3-95450-220-2',
        'event_issn': '2673-5474',
        'event_doi': '10.18429/JACoW-FEL2022',
    }

    def init(self):
        super(PurrPlugin, self).init()
        self.register_assets()
        self.connect(signals.menu.items, self.purr_sidemenu_items, sender='event-management-sidemenu')

    def purr_sidemenu_items(self, sender, event, **kwargs):
        if event.can_manage(session.user):
            yield SideMenuItem('purr', _('PURR'), url_for_plugin('purr.purr_home', event),
                               0, section='workflows', icon='pdf')

    def get_blueprints(self):
        return blueprint

    def register_assets(self):
        self.inject_bundle('script.js', WPEventManagement)
        self.inject_bundle('style.css', WPEventManagement)

