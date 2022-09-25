from __future__ import unicode_literals



from indico.core import signals

from indico.util.i18n import _

from indico.web.flask.util import url_for
from indico.web.menu import SideMenuItem

from indico_jpsp_ab.blueprint import IndicoJpspAbPBlueprint
from indico_jpsp_ab.plugin import IndicoJpspAbPlugin

from flask import session


blueprint = IndicoJpspAbPBlueprint
plugin = IndicoJpspAbPlugin


@signals.menu.items.connect_via('event-management-sidemenu')
def jpsp_ab_sidemenu_items(sender, event, **kwargs):
    if event.can_manage(session.user):
        yield SideMenuItem('jpsp', _('Abstract Booklet'), url_for('plugin_jpsp_ab.get-ab', event), 0, section='workflows', icon='pdf')
            
