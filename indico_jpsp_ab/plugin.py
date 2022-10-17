from wtforms import StringField, BooleanField

from indico.core.plugins import IndicoPlugin
from indico.util.i18n import _
from indico.web.forms.base import IndicoForm



from indico_jpsp_ab.blueprint import JpspAbPBlueprint



class JpspNgPlugin(IndicoPlugin):

    configurable = False
    
    def init(self):
        super(JpspNgPlugin, self).init()
        self.register_assets()

    def get_blueprints(self):
        return JpspAbPBlueprint

    def register_assets(self):
        self.inject_bundle('script.js')
        self.inject_bundle('style.css')
