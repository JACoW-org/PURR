from wtforms import StringField, BooleanField

from indico.core.plugins import IndicoPlugin
from indico.util.i18n import _
from indico.web.forms.base import IndicoForm



from indico_jpsp_ab.blueprint import JpspAbPBlueprint


class SettingsForm(IndicoForm):
    dummy_message = StringField('Dummy Message')
    show_message = BooleanField('Show Message')


class JpspNgPlugin(IndicoPlugin):

    configurable = True
    settings_form = SettingsForm
    default_settings = {'dummy_message': '',
                        'show_message': False}
    
    def init(self):
        super(JpspNgPlugin, self).init()
        self.register_assets()

    def get_blueprints(self):
        return JpspAbPBlueprint

    def register_assets(self):
        
        self.inject_bundle('script.js')
        self.inject_bundle('style.css')
            
        # self.register_js_bundle('example_js', 'js/example.js')
        # self.register_js_bundle('global_js', 'js/global.js')
        # self.register_css_bundle('example_css', 'css/example.scss')
        # self.register_css_bundle('global_css', 'css/global.scss')

        pass