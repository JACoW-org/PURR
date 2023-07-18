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
        'pdf_page_height': 792.0,
        'custom_fields': [],
        'ab_session_h1': '{code} - {title}',
        'ab_session_h2': '{start} / {end}',
        'ab_contribution_h1': '| {code} | / | {start} |',
        'ab_contribution_h2': '| {code} | / | {start} |',
        'isbn': '',
        'issn': '',
        'booktitle_short': '',
        'booktitle_long': '',
        'series': '',
        'series_number': '',
        'pre_print': '',
        'location': '',
        'host_info': '',
        'editorial_board': '',
        'editorial_json': '',
        'doi_env': 'test',
        'doi_proto': 'https',
        'doi_domain': 'doi.org',
        'doi_context': '10.18429',
        'doi_organization': 'JACoW',
        'doi_conference': '',
        'doi_user': '',
        'doi_password': '',
        'date': '',
        'toc_grouping': ['contribution'],
        'primary_color': '#F39433',
        'materials': []
    }

    def init(self):
        super(PurrPlugin, self).init()
        self.register_assets()
        self.connect(signals.menu.items, self.purr_sidemenu_items,
                     sender='event-management-sidemenu')

    def purr_sidemenu_items(self, sender, event, **kwargs):
        if event.can_manage(session.user):
            yield SideMenuItem('purr', _('PURR'), url_for_plugin('purr.purr_home', event),
                               0, section='workflows', icon='pdf')

    def get_blueprints(self):
        return blueprint

    def register_assets(self):
        self.inject_bundle('script.js', WPEventManagement)
        self.inject_bundle('style.css', WPEventManagement)
