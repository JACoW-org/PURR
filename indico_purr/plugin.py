from flask_pluginengine import render_plugin_template

from indico.core.plugins import IndicoPlugin
from indico.modules.events.management.views import WPEventManagement

from indico_purr.blueprint import PurrPluginBlueprint


class PurrPlugin(IndicoPlugin):

    configurable = False

    def init(self):
        super(PurrPlugin, self).init()
        self.register_assets()
        # self.register_hook()

    def get_blueprints(self):
        return PurrPluginBlueprint

    def register_assets(self):
        self.inject_bundle('script.js', WPEventManagement)
        self.inject_bundle('style.css', WPEventManagement)

    def register_hook(self):
        self.template_hook('attachment-sources', self._inject_check_pdf_button)

    def _inject_check_pdf_button(self, linked_object=None, **kwargs):
        return render_plugin_template('check_pdf_button.html', linked_object=linked_object,
                                      service_name=self.settings.get('service_name'),
                                      button_icon_url=self.settings.get('button_icon_url'))
