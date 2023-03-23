from flask import session
from flask_pluginengine import render_plugin_template

from indico.core import signals
from indico.core.plugins import IndicoPlugin, url_for_plugin
from indico.modules.events.management.views import WPEventManagement
from indico.web.menu import SideMenuItem

from indico_purr import _
from indico_purr.blueprint import blueprint


class PurrPlugin(IndicoPlugin):

    configurable = False

    def init(self):
        super(PurrPlugin, self).init()
        self.register_assets()
        # self.register_hook()
        self.connect(signals.menu.items, self.purr_sidemenu_items, sender='event-management-sidemenu')

    def purr_sidemenu_items(self, sender, event, **kwargs):
        if event.can_manage(session.user):
            yield SideMenuItem('purr', _('PURR'), url_for_plugin('purr.purr-home', event),
                               0, section='workflows', icon='pdf')

    def get_blueprints(self):
        return blueprint

    def register_assets(self):
        self.inject_bundle('script.js', WPEventManagement)
        self.inject_bundle('style.css', WPEventManagement)

    def register_hook(self):
        self.template_hook('attachment-sources', self._inject_check_pdf_button)

    def _inject_check_pdf_button(self, linked_object=None, **kwargs):
        return render_plugin_template('check_pdf_button.html', linked_object=linked_object,
                                      service_name=self.settings.get('service_name'),
                                      button_icon_url=self.settings.get('button_icon_url'))
