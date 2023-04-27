from flask import session

from indico.core import signals
from indico.core.plugins import IndicoPlugin, url_for_plugin
from indico.modules.events.management.views import WPEventManagement
from indico.web.menu import SideMenuItem

from indico_purr import _
from indico_purr.blueprint import blueprint


class PurrPlugin(IndicoPlugin):
    """ PURR """

    configurable = False
    default_event_settings = {
        'connected': False,
        'api_url': '',
        'api_key': '',
        'pdf_page_width': 595.0,
        'pdf_page_height': 791.0,
        'custom_fields': [],
        'ab_session_h1': '{code} - {title}',
        'ab_session_h2': '{start} / {end}',
        'ab_contribution_h1': '| {code} | / | {start} |',
        'ab_contribution_h2': '| {code} | / | {start} |',
        'isbn': 'Insert ISBN',
        'issn': 'Insert ISSN',
        'booktitle_short': 'Insert short booktitle',
        'booktitle_long': 'Insert long booktitle',
        'series': 'Insert series',
        'series_number': 'Insert series number',
        'location': 'Insert location',
        'host_info': 'Insert Host info',
        'editorial_board': 'Insert Editorial board',
        'doi_base_url': 'Insert DOI base url',
        'doi_user': 'Insert DOI user',
        'doi_password': 'Insert password',
        'date': 'Insert event date',
        
        'primary_color': '#F39433',
        'site_base_url': 'http://127.0.0.1:8080/fel2022/'
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

